import {
    buildQuery,
    type ListParams,
    request
} from '@/shared/api/request'
import type { LanguageRead } from '@/features/languages/model'

export function listLanguages(params: ListParams = {}): Promise<LanguageRead[]> {
    return request<LanguageRead[]>(`/crew${buildQuery(params)}`)
}