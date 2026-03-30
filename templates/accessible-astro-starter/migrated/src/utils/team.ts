import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

export interface TeamMember {
  name: string
  initials: string
  role: string
  image?: string
  bio?: string
}

let _team: TeamMember[] | null = null

export function getTeam(): TeamMember[] {
  if (!_team) {
    const filePath = path.resolve('data/team.yml')
    const raw = fs.readFileSync(filePath, 'utf-8')
    _team = yaml.load(raw) as TeamMember[]
  }
  return _team
}

export function getTeamMember(name: string): TeamMember | undefined {
  return getTeam().find((m) => m.name === name)
}
