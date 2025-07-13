import { useState, useMemo } from 'react';
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
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { TwitterProject } from '@/lib/csv-loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';

interface ProjectsTableProps {
  projects: TwitterProject[];
  title: string;
  showUrlColumn?: boolean;
}

const columnHelper = createColumnHelper<TwitterProject>();

export function ProjectsTable({ projects, title, showUrlColumn = true }: ProjectsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => [
    columnHelper.accessor('author_name', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
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
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {row.original.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{row.original.author_name}</div>
            <div className="text-sm text-muted-foreground">@{row.original.author_screen_name}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('project_description', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
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
        <div className="max-w-md">
          <p className="text-sm leading-relaxed line-clamp-3">{row.original.project_description}</p>
        </div>
      ),
    }),
    ...(showUrlColumn ? [
      columnHelper.accessor('project_url', {
        header: 'Project',
        cell: ({ row }) => 
          row.original.project_url ? (
            <a
              href={row.original.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">View</span>
            </a>
          ) : (
            <span className="text-muted-foreground text-sm">No URL</span>
          ),
      })
    ] : []),
    columnHelper.accessor('media_thumbnail', {
      header: 'Media',
      cell: ({ row }) => 
        row.original.media_thumbnail ? (
          <img
            src={row.original.media_thumbnail}
            alt="Project preview"
            className="w-16 h-16 object-cover rounded-lg"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No media</span>
          </div>
        ),
    }),
    columnHelper.accessor('created_at', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
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
        <div className="text-sm">
          {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
        </div>
      ),
    }),
    columnHelper.accessor('favorite_count', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Likes
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
        <div className="text-sm font-medium">
          {row.original.favorite_count.toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor('category', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold hover:bg-transparent"
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
        <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
          {row.original.category}
        </span>
      ),
    }),
  ], [showUrlColumn]);

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

  const parentRef = useState<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef[0],
    estimateSize: () => 80,
    overscan: 5,
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map(p => p.category || 'Uncategorized')));
    return cats.sort();
  }, [projects]);

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

      {/* Table */}
      <div className="border rounded-lg">
        <div className="overflow-auto" style={{ height: '600px' }} ref={parentRef[1]}>
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="h-12 px-4 text-left align-middle font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="relative">
              <tr style={{ height: `${virtualizer.getTotalSize()}px` }}>
                <td></td>
              </tr>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50 absolute w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}