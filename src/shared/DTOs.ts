import {RGBColor} from "react-color"

export interface GameDataDTO {
    players: PlayerDTO[]
    asteroids: AsteroidDTO[]
    bullets: BulletDTO[]
    canvasWidth: number
    canvasHeight: number
}

export interface PlayerDTO {
    id: string
    name: string
    color: RGBColor
    x: number
    y: number
    size: number
    heading: number
    vertices: number[][]
    showTail: boolean
}

export interface AsteroidDTO {
    id: string
    x: number
    y: number
    rotation: number
    vertices: number[][]
}

export interface PlayerInputDTO {
    left: boolean
    right: boolean
    up: boolean
    fire: boolean
}

export interface ProjectSelectionDataDTO {
    isRoot: boolean
    previews: ProjectPreviewDTO[]
}

export interface ProjectPreviewDTO {
    projectNum: number
    title: string
    isOpen: boolean
}

export enum ProjectSelectionMessageDTO {
    ROOTED,
    UNROOTED,
    PROJECT_LOCKED,
    PROJECT_UNLOCKED,
    PERMISSION_DENIED
}

export interface BulletDTO {
    id: string
    x: number
    y: number
    heading: number
    vertices: number[][]
    color: RGBColor
}
