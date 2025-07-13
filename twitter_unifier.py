import pandas as pd
import json
import re
from urllib.parse import urlparse


def extract_github_url(text):
    """Extract GitHub URL from text, handling t.co redirects"""
    tco_pattern = r'https://t\.co/\w+'
    tco_matches = re.findall(tco_pattern, text)
    return tco_matches[0] if tco_matches else None


def extract_media_info(media_str):
    """Extract media information from the media field"""
    if not media_str or media_str == '[]':
        return None, None, None
    try:
        media_list = json.loads(media_str)
        if media_list and len(media_list) > 0:
            media_item = media_list[0]
            return (
                media_item.get('type'),
                media_item.get('thumbnail'),
                media_item.get('original')
            )
    except (json.JSONDecodeError, KeyError):
        pass
    return None, None, None


def extract_project_url_from_card(metadata_str):
    """Extract project URL from card metadata in reply tweets"""
    if not metadata_str:
        return None
    try:
        metadata = json.loads(metadata_str)
        if 'card' in metadata and 'legacy' in metadata['card'] and 'binding_values' in metadata['card']['legacy']:
            binding_values = metadata['card']['legacy']['binding_values']
            for binding in binding_values:
                if binding.get('key') == 'card_url':
                    return binding.get('value', {}).get('string_value')
                elif binding.get('key') == 'title':
                    title = binding.get('value', {}).get('string_value', '')
                    if 'github.com' in title.lower():
                        github_match = re.search(r'GitHub - ([^:]+)', title)
                        if github_match:
                            repo_path = github_match.group(1)
                            return f"https://github.com/{repo_path}"
        if 'legacy' in metadata and 'entities' in metadata['legacy']:
            entities = metadata['legacy']['entities']
            if 'urls' in entities and entities['urls']:
                return entities['urls'][0].get('expanded_url')
    except (json.JSONDecodeError, KeyError):
        pass
    return None


def extract_best_url_from_metadata(metadata_str):
    """Extract the best possible URL from the metadata field of the original tweet."""
    if not metadata_str or metadata_str == 'null':
        return None
    try:
        metadata = json.loads(metadata_str)
        # Try entities.urls[0].expanded_url
        legacy = metadata.get('legacy', {})
        entities = legacy.get('entities', {})
        urls = entities.get('urls', [])
        if urls and 'expanded_url' in urls[0]:
            return urls[0]['expanded_url']
        # Fallback: entities.urls[0].url
        if urls and 'url' in urls[0]:
            return urls[0]['url']
        # Fallback: legacy.url
        if 'url' in legacy:
            return legacy['url']
        # Fallback: core.user_results.result.legacy.url
        core = metadata.get('core', {})
        user_results = core.get('user_results', {})
        result = user_results.get('result', {})
        user_legacy = result.get('legacy', {})
        if 'url' in user_legacy:
            return user_legacy['url']
    except Exception:
        pass
    return None


def process_twitter_dump(input_file, output_file):
    """Process Twitter dump and create unified project CSV"""
    
    # Read the CSV file, ensuring ID columns are treated as strings
    # THIS IS THE KEY FIX:
    df = pd.read_csv(input_file, dtype={'id': str, 'in_reply_to': str})
    
    print(f"Loaded {len(df)} tweets from {input_file}")
    
    # Sort by creation time to ensure proper ordering
    df['created_at'] = pd.to_datetime(df['created_at'])
    df = df.sort_values('created_at')
    
    # Separate original tweets from replies
    original_tweets = df[df['in_reply_to'].isnull() | (df['in_reply_to'] == 'null')].copy()
    reply_tweets = df[df['in_reply_to'].notnull() & (df['in_reply_to'] != 'null')].copy()
    
    print(f"Found {len(original_tweets)} original tweets and {len(reply_tweets)} reply tweets")

    # Debug: Check types (should now both be 'object', which means string for pandas)
    print(f"Original tweet ID types: {original_tweets['id'].dtype}")
    print(f"Reply in_reply_to types: {reply_tweets['in_reply_to'].dtype}")

    # Create unified projects list
    unified_projects = []
    
    for _, original_tweet in original_tweets.iterrows():
        # tweet_id is already a string, no need for str() conversion
        tweet_id = original_tweet['id']
        
        description = re.sub(r'https://t\.co/\w+', '', original_tweet['full_text']).strip()
        media_type, media_thumbnail, media_original = extract_media_info(original_tweet['media'])

        # Extract original tweet URL from metadata
        original_tweet_url = extract_best_url_from_metadata(original_tweet.get('metadata'))
        
        # Look for corresponding reply tweet. Comparison is now string vs string.
        reply_tweet = reply_tweets[reply_tweets['in_reply_to'] == tweet_id]
        
        project_url = None
        if not reply_tweet.empty:
            reply_row = reply_tweet.iloc[0]
            # print(f"Processing reply for tweet {tweet_id}") # You can re-enable this for verbosity
            
            project_url = extract_project_url_from_card(reply_row.get('metadata'))
            if not project_url:
                project_url = extract_github_url(reply_row['full_text'])
        else:
            # This will now only print for tweets that truly don't have a reply in the dataset
            print(f"No reply found for tweet {tweet_id}")
            # Optional debug to check what's going on
            # print(f"  Match found: {tweet_id in reply_tweets['in_reply_to'].values}")

        project_entry = {
            'id': tweet_id,
            'created_at': original_tweet['created_at'],
            'project_description': description,
            'project_url': project_url,
            'media_type': media_type,
            'media_thumbnail': media_thumbnail,
            'media_original': media_original,
            'author_screen_name': original_tweet['screen_name'],
            'author_name': original_tweet['name'],
            'favorite_count': original_tweet['favorite_count'],
            'retweet_count': original_tweet['retweet_count'],
            'reply_count': original_tweet['reply_count'],
            'views_count': original_tweet['views_count'],
            'original_tweet_url': original_tweet_url  # <-- new field
        }
        
        unified_projects.append(project_entry)
    
    output_df = pd.DataFrame(unified_projects)
    output_df.to_csv(output_file, index=False)
    
    print(f"Processed {len(unified_projects)} projects")
    print(f"Output saved to {output_file}")
    
    return output_df


if __name__ == "__main__":
    input_file = "twitter_dump.csv"
    output_file = "unified_projects.csv"
    
    result_df = process_twitter_dump(input_file, output_file)
    
    print("\nSample output:")
    if not result_df.empty:
        print(result_df.head())
        if 'project_url' in result_df.columns:
            missing_urls = result_df[result_df['project_url'].isnull()]
            if not missing_urls.empty:
                print(f"\nWarning: {len(missing_urls)} projects missing URLs:")
                print(missing_urls[['id', 'project_description']].head())
            else:
                print("\nAll projects have URLs!")
    else:
        print("No data processed!")