interface PlaceholderPageProps {
  title: string
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg text-muted-foreground">This page is under construction</p>
        <div className="text-6xl">🚧</div>
      </div>
    </div>
  )
}
