'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { applyFieldAliases } from '@/lib/cmsFields';
import { cmsFallbackFields } from '@/lib/data';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { SectionField } from '@/types/cms';
import { toSafeString } from '@/lib/utils';
import type { PublicHookResult } from './usePublicRows';


function usableJson(value: unknown) {
  return value !== null && value !== undefined && !(typeof value === 'object' && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length === 0);
}

export function resolvePublicFieldValue(field: SectionField) {
  if (field.field_value !== null && field.field_value !== undefined && toSafeString(field.field_value).trim() !== '') return field.field_value;
  if (usableJson(field.field_json)) return typeof field.field_json === 'string' ? field.field_json : JSON.stringify(field.field_json);
  return '';
}

export function publicFieldMap(fields: SectionField[], sectionKey = '') {
 const map: Record<string, unknown> = {};
 for(const field of fields)map[field.field_key]=resolvePublicFieldValue(field);
 return applyFieldAliases(map,sectionKey);
}

export function usePublicSection(sectionKey: string, fallbackFields: SectionField[] = cmsFallbackFields[sectionKey] ?? []): PublicHookResult<Record<string, unknown>> {
  const fallbackRef = useRef(fallbackFields);
  fallbackRef.current = fallbackFields;
  const [fields, setFields] = useState<SectionField[]>(fallbackFields);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') {
      setFields(fallbackRef.current); setLoading(false); setError(isSupabaseConfigured ? null : 'Supabase não configurado.');
      return publicFieldMap(fallbackRef.current, sectionKey);
    }
    setLoading(true);
    const section = await supabase.from('page_sections').select('id').eq('section_key', sectionKey).eq('is_active', true).maybeSingle();
    if (section.error || !section.data?.id) {
      setLoading(false); setError(section.error?.message ?? null); setFields(fallbackRef.current);
      return publicFieldMap(fallbackRef.current, sectionKey);
    }
    const result = await supabase.from('section_fields').select('*').eq('section_id', section.data.id).order('order_index');
    setLoading(false);
    if (result.error) { setError(result.error.message); setFields(fallbackRef.current); return publicFieldMap(fallbackRef.current, sectionKey); }
    const next = (result.data ?? []) as SectionField[];
    setError(null); setFields(next); return publicFieldMap(next, sectionKey);
  }, [sectionKey]);

  useEffect(() => { void refresh(); }, [refresh]);
  const data = useMemo(() => publicFieldMap(fields, sectionKey), [fields, sectionKey]);
  return useMemo(() => ({ data, loading, error, refresh }), [data, loading, error, refresh]);
}
