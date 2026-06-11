import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Search, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { globalSearch } from "@/lib/api/search.server"

export function GlobalSearch() {
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  
  // Debounce the query manually
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { data: results, isLoading } = useQuery({
    queryKey: ["globalSearch", debouncedQuery],
    queryFn: () => globalSearch({ data: debouncedQuery }),
    enabled: debouncedQuery.length >= 2,
  })

  const handleSelect = (type: string, id: string) => {
    setOpen(false)
    setQuery("")
    
    switch(type) {
      case 'policy': navigate({ to: `/policies/$id`, params: { id: `P-${id}` } }); break;
      case 'customer': navigate({ to: `/customers/$id`, params: { id: `C-${id}` } }); break;
      case 'agent': navigate({ to: `/agents` }); break; 
      case 'claim': navigate({ to: `/claims` }); break; 
    }
  }

  const hasResults = results && (results.policies.length > 0 || results.customers.length > 0 || results.agents.length > 0 || results.claims.length > 0)

  return (
    <div className="relative w-full max-w-sm" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search policies, customers..."
          className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (query.length >= 2) setOpen(true)
          }}
        />
        {isLoading && query.length >= 2 && (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl z-50">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {!isLoading && !hasResults && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}

            {results?.policies && results.policies.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Policies</div>
                {results.policies.map((p) => (
                  <button key={`policy-${p.id}`} onClick={() => handleSelect('policy', p.id)} className="w-full flex flex-col items-start rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <span className="font-medium">{p.display}</span>
                    <span className="text-xs text-muted-foreground">{p.sub}</span>
                  </button>
                ))}
              </div>
            )}

            {results?.customers && results.customers.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customers</div>
                {results.customers.map((c) => (
                  <button key={`customer-${c.id}`} onClick={() => handleSelect('customer', c.id)} className="w-full flex flex-col items-start rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <span className="font-medium">{c.display}</span>
                    <span className="text-xs text-muted-foreground">{c.sub}</span>
                  </button>
                ))}
              </div>
            )}

            {results?.agents && results.agents.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agents</div>
                {results.agents.map((a) => (
                  <button key={`agent-${a.id}`} onClick={() => handleSelect('agent', a.id)} className="w-full flex flex-col items-start rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <span className="font-medium">{a.display}</span>
                    <span className="text-xs text-muted-foreground">{a.sub}</span>
                  </button>
                ))}
              </div>
            )}

            {results?.claims && results.claims.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Claims</div>
                {results.claims.map((c) => (
                  <button key={`claim-${c.id}`} onClick={() => handleSelect('claim', c.id)} className="w-full flex flex-col items-start rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                    <span className="font-medium">{c.display}</span>
                    <span className="text-xs text-muted-foreground">{c.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
