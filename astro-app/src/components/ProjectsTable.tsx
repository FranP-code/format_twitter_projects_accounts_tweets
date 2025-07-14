import { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ExternalLink, Twitter, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TwitterProject } from '@/lib/csv-loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { markProjectAsSeen, markProjectAsUnseen, isProjectSeen } from '@/lib/seen-projects';

interface ProjectsTableProps {
  projects: TwitterProject[];
  title: string;
  showUrlColumn?: boolean;
  onSeenStatusChange?: () => void;
}

const columnHelper = createColumnHelper<TwitterProject>();

export function ProjectsTable({ projects, title, showUrlColumn = true, onSeenStatusChange }: ProjectsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [seenProjects, setSeenProjects] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update seen projects state when component mounts or projects change
    const updateSeenState = () => {
      const seen = new Set<string>();
      projects.forEach(project => {
        if (isProjectSeen(project.id)) {
          seen.add(project.id);
        }
      });
      setSeenProjects(seen);
    };
    
    updateSeenState();
  }, [projects]);

  const toggleSeen = (projectId: string) => {
    const isCurrentlySeen = seenProjects.has(projectId);
    
    if (isCurrentlySeen) {
      markProjectAsUnseen(projectId);
      setSeenProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    } else {
      markProjectAsSeen(projectId);
      setSeenProjects(prev => new Set(prev).add(projectId));
    }
    
    onSeenStatusChange?.();
  };

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'seen',
      header: "Seen",
      cell: ({ row }) => {
        const projectId = row.original.id;
        const isSeen = seenProjects.has(projectId);
        
        return (
          <div className="flex justify-center items-center">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border bg-background"
              checked={isSeen}
              onChange={() => toggleSeen(projectId)}
            />
          </div>
        );
      },
      size: 80,
    }),
    columnHelper.accessor('author_name', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent justify-start w-full"
        >
          Author
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3 w-full">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {row.original.author_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{row.original.author_name}</div>
            <div className="text-xs text-muted-foreground truncate">@{row.original.author_screen_name}</div>
          </div>
        </div>
      ),
      size: 160,
    }),
    columnHelper.accessor('project_description', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent justify-start w-full"
        >
          Description
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="w-full">
          <p className="text-sm leading-relaxed line-clamp-3 pr-2">{row.original.project_description}</p>
        </div>
      ),
      size: 280,
    }),
    columnHelper.display({
      id: 'links',
      header: 'Links',
      cell: ({ row }) => (
        <div className="w-full flex flex-col space-y-1">
          {showUrlColumn && (
            <div className="flex justify-center">
              {row.original.project_url ? (
                <a
                  href={row.original.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="text-xs">Project</span>
                </a>
              ) : (
                <span className="text-muted-foreground text-xs">No URL</span>
              )}
            </div>
          )}
          <div className="flex justify-center">
            {row.original.original_tweet_url ? (
              <a
                href={row.original.original_tweet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-500 hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-3 h-3" />
                <span className="text-xs">Tweet</span>
              </a>
            ) : (
              <span className="text-muted-foreground text-xs">No Tweet</span>
            )}
          </div>
        </div>
      ),
      size: 80,
    }),
    columnHelper.accessor('media_thumbnail', {
      header: 'Media',
      cell: ({ row }) => (
        <div className="w-full flex justify-center items-center">
          {row.original.media_thumbnail ? (
            <img
              src={row.original.media_thumbnail}
              alt="Project preview"
              className="w-20 h-20 object-cover rounded-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center">No media</span>
            </div>
          )}
        </div>
      ),
      size: 100,
    }),
    columnHelper.accessor('created_at', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent justify-start w-full"
        >
          Date
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm w-full">
          {row.original.created_at && !isNaN(new Date(row.original.created_at).getTime()) 
            ? formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })
            : 'N/A'}
        </div>
      ),
      size: 100,
    }),
    columnHelper.accessor('category', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent justify-start w-full"
        >
          Category
          {column.getIsSorted() === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="w-full">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
            {row.original.category || 'Uncategorized'}
          </span>
        </div>
      ),
      size: 100,
    })
  ], [showUrlColumn, seenProjects]);

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88,
    overscan: 5,
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map(p => p.category || 'Uncategorized')));
    return cats.sort();
  }, [projects]);

  // Calculate total width
  const totalWidth = table.getHeaderGroups()[0]?.headers.reduce((acc, header) => acc + header.getSize(), 0) || 800;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {projects.length} projects
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-48">
          <Select
            value={(table.getColumn('category')?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn('category')?.setFilterValue(e.target.value === 'all' ? '' : e.target.value)
            }
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="w-full">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-muted/50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
                <div key={headerGroup.id} className="grid" style={{ gridTemplateColumns: headerGroup.headers.map(h => `${h.getSize()}px`).join(' ') }}>
                {headerGroup.headers.map((header) => (
                    <div 
                    key={header.id} 
                    className="px-4 py-3 text-left font-medium border-r border-border last:border-r-0 flex items-center"
                    >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                ))}
                </div>
            ))}
            </div>

            {/* Virtual Scrollable Body */}
            <div 
            ref={parentRef}
            className="h-[600px] overflow-auto relative"
            >
            <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
                {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                    <div
                    key={row.id}
                    className={`absolute w-full border-b border-border hover:bg-muted/50 transition-colors grid ${seenProjects.has(row.original.id) ? 'opacity-60 bg-muted/30' : ''}`}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      gridTemplateColumns: row.getVisibleCells().map(cell => `${cell.column.getSize()}px`).join(' ')
                    }}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <div
                        key={cell.id}
                        className="px-4 py-3 border-r border-border last:border-r-0 flex items-center overflow-hidden"
                        >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                    ))}
                    </div>
                );
                })}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}