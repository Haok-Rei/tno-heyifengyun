// Generated route-specific news illustrations.
export const EXPANDED_NEWS_ART: Record<string,string> = {
 "split": new URL("../assets/events/news/expanded_split.webp", import.meta.url).href,
 "bureau": new URL("../assets/events/news/expanded_bureau.webp", import.meta.url).href,
 "riot": new URL("../assets/events/news/expanded_riot.webp", import.meta.url).href,
 "workgroup": new URL("../assets/events/news/expanded_workgroup.webp", import.meta.url).href,
 "welfare": new URL("../assets/events/news/expanded_welfare.webp", import.meta.url).href,
 "library": new URL("../assets/events/news/expanded_library.webp", import.meta.url).href,
 "victory": new URL("../assets/events/news/expanded_victory.webp", import.meta.url).href,
 "crisis": new URL("../assets/events/news/expanded_crisis.webp", import.meta.url).href,
 "yang": new URL("../assets/events/news/expanded_yang.webp", import.meta.url).href,
 "jidi": new URL("../assets/events/news/expanded_jidi.webp", import.meta.url).href,
 "cyber": new URL("../assets/events/news/expanded_cyber.webp", import.meta.url).href,
 "law": new URL("../assets/events/news/expanded_law.webp", import.meta.url).href,
};
export function getExpandedNewsArt(id: string): string | undefined {
 if (new RegExp("secession|six_schools|六中|八中|学校自治", "i").test(id)) return EXPANDED_NEWS_ART.split;
 if (new RegExp("bureau_|教育局|请求援助", "i").test(id)) return EXPANDED_NEWS_ART.bureau;
 if (new RegExp("riot|暴乱|价格牌", "i").test(id)) return EXPANDED_NEWS_ART.riot;
 if (new RegExp("workgroup|fieldwork|工作组|工作队", "i").test(id)) return EXPANDED_NEWS_ART.workgroup;
 if (new RegExp("welfare|material|student_supply|福利|食堂|物资|物质统筹", "i").test(id)) return EXPANDED_NEWS_ART.welfare;
 if (new RegExp("library|academic_freedom|图书|书籍|禁书|学术自由", "i").test(id)) return EXPANDED_NEWS_ART.library;
 if (new RegExp("unification|campus_unified|统一校园|校园统一|重建校园", "i").test(id)) return EXPANDED_NEWS_ART.victory;
 if (new RegExp("crisis|exam_warning|倒计时|危机|考试临近", "i").test(id)) return EXPANDED_NEWS_ART.crisis;
 if (new RegExp("yang_|yy_|heyi_yang|杨玉乐|办公桌", "i").test(id)) return EXPANDED_NEWS_ART.yang;
 if (new RegExp("jidi_|heyi_jidi|及第|企业校园|教育金融", "i").test(id)) return EXPANDED_NEWS_ART.jidi;
 if (new RegExp("cyber|gouxiong_chat|gouxiong_map|论坛|赛博|网民|网络舆论", "i").test(id)) return EXPANDED_NEWS_ART.cyber;
 if (new RegExp("bill|advisor|appointment|law_|章程|法案|任命|顾问", "i").test(id)) return EXPANDED_NEWS_ART.law;
 return undefined;
}
