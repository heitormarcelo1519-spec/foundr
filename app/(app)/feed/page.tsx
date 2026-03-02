import { createClient } from '@/lib/supabase/server'
import IdeaCard from '@/components/IdeaCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Rocket, Search } from 'lucide-react'
import { IdeaWithOwner } from '@/types/database'

export default async function FeedPage() {
    const supabase = await createClient()

    const { data: ideas, error } = await supabase
        .from('ideas')
        .select(`
      *,
      profiles (*)
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Feed error:', error)
    }

    const ideaList = (ideas as IdeaWithOwner[]) ?? []

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">
                        Feed de <span className="gradient-text">Ideias</span>
                    </h1>
                    <p className="text-muted-foreground">
                        {ideaList.length} projeto{ideaList.length !== 1 ? 's' : ''} aberto{ideaList.length !== 1 ? 's' : ''} buscando talentos
                    </p>
                </div>
                <Link href="/ideas/new">
                    <Button id="feed-launch-btn" size="lg" className="gap-2">
                        <Rocket className="w-4 h-4" />
                        Lançar Projeto
                    </Button>
                </Link>
            </div>

            {/* Ideas grid */}
            {ideaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Nenhuma ideia ainda</h3>
                    <p className="text-muted-foreground mb-6">Seja o primeiro a lançar um projeto!</p>
                    <Link href="/ideas/new">
                        <Button className="gap-2">
                            <Rocket className="w-4 h-4" />
                            Lançar meu projeto
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideaList.map((idea, i) => (
                        <IdeaCard key={idea.id} idea={idea} index={i} />
                    ))}
                </div>
            )}
        </div>
    )
}
