export type AttentionLevel="NORMAL"|"WATCH"|"INTERVENE"|"CRITICAL"|"OPPORTUNITY";
export type RelationshipState="HABIT_LOST"|"MENTAL_SABOTAGE"|"COMMITTED"|"AMBASSADOR";
export function daysSince(value:string|null,now=Date.now()){return value?Math.max(0,Math.floor((now-new Date(value).getTime())/86400000)):null}
export function invisibleClient(lastHumanContact:string|null,lastActivity:string|null,limitDays=7,now=Date.now()){const human=daysSince(lastHumanContact,now),activity=daysSince(lastActivity,now);return(human===null||human>=limitDays)&&(activity===null||activity>=limitDays)}
export function attentionRank(input:{overdue:boolean;invisible:boolean;painRed:boolean;earlyExperience:boolean;opportunity:boolean}):AttentionLevel{if(input.painRed||input.overdue)return"CRITICAL";if(input.invisible&&input.earlyExperience)return"INTERVENE";if(input.invisible)return"WATCH";if(input.opportunity)return"OPPORTUNITY";return"NORMAL"}
export function firstWinEligible(input:{baseline:boolean;firstCheckin:boolean;firstWorkout:boolean;firstHumanContact:boolean}){return Object.values(input).filter(Boolean).length>=3}
