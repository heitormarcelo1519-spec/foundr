'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IdeaWithOwner } from '@/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { Clock, Users } from 'lucide-react'

interface IdeaCardProps {
    idea: IdeaWithOwner
    index: number
}

export default function IdeaCard({ idea, index }: IdeaCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
        >
            <Link href={`/ideas/${idea.id}`} id={`idea-card-${idea.id}`}>
                <Card className="h-full hover:border-violet-500/50 hover:glow-sm hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        {/* Creator info */}
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-9 h-9">
                                <AvatarImage src={idea.profiles.avatar_url ?? undefined} />
                                <AvatarFallback className="text-xs">{getInitials(idea.profiles.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium leading-none">{idea.profiles.full_name ?? 'Anônimo'}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatRelativeTime(idea.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-lg leading-tight group-hover:text-violet-300 transition-colors line-clamp-2">
                            {idea.title}
                        </h3>
                    </CardHeader>

                    <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {idea.description}
                        </p>
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-border/50 flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-auto">
                            <Users className="w-3 h-3" />
                            <span>Buscando:</span>
                        </div>
                        {(idea.needed_skills ?? []).slice(0, 3).map(skill => (
                            <Badge key={skill} variant="default" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {(idea.needed_skills ?? []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{(idea.needed_skills ?? []).length - 3}
                            </Badge>
                        )}
                    </CardFooter>
                </Card>
            </Link>
        </motion.div>
    )
}
