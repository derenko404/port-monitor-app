interface AppHeaderProps {
  title: React.ReactNode
  /** Right-aligned actions. Each interactive element needs `[-webkit-app-region:no-drag]`. */
  actions?: React.ReactNode
}

export function AppHeader({ title, actions }: AppHeaderProps): React.JSX.Element {
  return (
    <header className="relative flex items-center gap-2 border-b p-2 pl-19 [-webkit-app-region:drag]">
      <h1 className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm font-semibold">
        {title}
      </h1>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  )
}

export default AppHeader
