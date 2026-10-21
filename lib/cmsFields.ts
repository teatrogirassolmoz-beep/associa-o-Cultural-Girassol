import type { SectionField } from '@/types/cms';
/** Fields actually consumed by the current public components. Retired records remain in storage. */
export const currentSectionFields: Record<string, readonly string[]> = {
  "fiti_hero": [
    "background_video_url",
    "bottom_link_text",
    "bottom_link_url",
    "bottom_signature",
    "description",
    "eyebrow",
    "image_2_alt",
    "image_2_url",
    "image_3_alt",
    "image_3_url",
    "image_alt",
    "image_url",
    "manifesto_left",
    "manifesto_right",
    "poster_back",
    "poster_note",
    "poster_sticker",
    "poster_suffix",
    "primary_button_link",
    "primary_button_text",
    "scene_1_line",
    "scene_1_name",
    "scene_1_word",
    "scene_2_line",
    "scene_2_name",
    "scene_2_word",
    "scene_3_line",
    "scene_3_name",
    "scene_3_word",
    "secondary_button_link",
    "secondary_button_text",
    "subtitle",
    "title"
  ],
  "home_hero": [
    "background_video_url",
    "bottom_link_text",
    "bottom_link_url",
    "bottom_note",
    "bottom_signature",
    "description",
    "eyebrow",
    "fiti_spotlight_button",
    "fiti_spotlight_calendar_button",
    "fiti_spotlight_calendar_link",
    "fiti_spotlight_eyebrow",
    "fiti_spotlight_link",
    "fiti_spotlight_map_label",
    "fiti_spotlight_name",
    "fiti_spotlight_signature",
    "fiti_spotlight_text",
    "fiti_spotlight_title",
    "image_2_alt",
    "image_2_url",
    "image_3_alt",
    "image_3_url",
    "image_alt",
    "image_url",
    "manifesto_left",
    "manifesto_right",
    "poster_back",
    "poster_note",
    "poster_sticker",
    "poster_suffix",
    "primary_button_link",
    "primary_button_text",
    "scene_1_line",
    "scene_1_name",
    "scene_1_word",
    "scene_2_line",
    "scene_2_name",
    "scene_2_word",
    "scene_3_line",
    "scene_3_name",
    "scene_3_word",
    "secondary_button_link",
    "secondary_button_text",
    "subtitle",
    "title"
  ],
  "home_what_we_do": [
    "cards",
    "eyebrow",
    "section_title",
    "side_note"
  ],
  "home_contact": [
    "eyebrow",
    "section_title"
  ],
  "fiti_contact": [
    "eyebrow",
    "section_title"
  ],
  "home_mission_vision": [
    "eyebrow",
    "mission",
    "section_title",
    "values",
    "vision"
  ],
  "home_timeline": [
    "eyebrow",
    "section_title"
  ],
  "home_news": [
    "eyebrow",
    "section_title"
  ],
  "fiti_partners": [
    "eyebrow",
    "section_title"
  ],
  "home_partners": [
    "eyebrow",
    "section_title"
  ],
  "home_impact": [
    "eyebrow",
    "section_title"
  ],
  "home_about": [
    "art_caption",
    "art_stamp",
    "eyebrow",
    "founding_year",
    "history_button",
    "history_link",
    "image_caption",
    "image_url",
    "section_text",
    "section_title",
    "signature",
    "year_caption"
  ],
  "home_projects": [
    "art_phrase",
    "brand_label",
    "details_label",
    "eyebrow",
    "fiti_link_label",
    "illustration_label",
    "project_link_label",
    "section_title",
    "side_note"
  ],
  "home_gallery": [
    "eyebrow",
    "section_title"
  ],
  "fiti_tickets": [
    "eyebrow",
    "primary_button_link",
    "primary_button_text",
    "secondary_button_link",
    "secondary_button_text",
    "section_text",
    "section_title"
  ],
  "fiti_companies": [
    "eyebrow",
    "section_title"
  ],
  "fiti_workshops": [
    "section_title"
  ],
  "fiti_archive": [
    "eyebrow",
    "section_title"
  ],
  "fiti_program": [
    "empty_state_text",
    "eyebrow",
    "filters_enabled",
    "layout_style",
    "section_subtitle",
    "section_title"
  ],
  "fiti_press": [
    "cards",
    "eyebrow",
    "section_text",
    "section_title"
  ],
  "fiti_current_edition": [
    "eyebrow",
    "section_title"
  ],
  "fiti_about": [
    "eyebrow",
    "institutional_note",
    "section_text",
    "section_title"
  ],
  "fiti_forms": [
    "company_option",
    "eyebrow",
    "info_option",
    "press_option",
    "section_title",
    "volunteer_option"
  ]
};
export function sectionFieldAliases(sectionKey = ''): Record<string, string[]> {
 return {
  primary_button_text:['primary_button_label'], primary_button_link:['primary_button_url'],
  secondary_button_text:['secondary_button_label'], secondary_button_link:['secondary_button_url'],
  ...(sectionKey.endsWith('_hero') ? {title:['section_title'],description:['section_text','text']} : {section_title:['title'],section_text:['text','description']}),
 };
}
export function isCurrentSection(key: string) { return Object.hasOwn(currentSectionFields,key); }
export function isCurrentField(section: string, key: string) { return currentSectionFields[section]?.includes(key) ?? false; }
export function selectEditableFields(section: string, stored: SectionField[], defaults: SectionField[]): SectionField[] {
 const aliases=sectionFieldAliases(section), seen=new Set<string>();
 return defaults.filter(field=>isCurrentField(section,field.field_key)).filter(field=>{if(seen.has(field.field_key))return false;seen.add(field.field_key);return true;}).map(definition=>{
  const saved=stored.find(field=>field.field_key===definition.field_key) ?? aliases[definition.field_key]?.map(key=>stored.find(field=>field.field_key===key)).find(Boolean);
  return saved ? {...definition,...saved,field_key:definition.field_key,field_label:definition.field_label} : {...definition,section_id:stored[0]?.section_id??definition.section_id};
 });
}

/** Prefer the current key even when intentionally empty; old values must not reappear after editing. */
export function applyFieldAliases(map: Record<string,unknown>, section = '') {
 for(const [canonical,names] of Object.entries(sectionFieldAliases(section))){
  const source=Object.hasOwn(map,canonical)?canonical:names.find(name=>Object.hasOwn(map,name));
  if(source!==undefined){const value=map[source];map[canonical]=value;for(const name of names)map[name]=value;}
 }
 return map;
}
