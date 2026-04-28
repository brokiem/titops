import type {CardAssignment} from "@server/db/schema";
import type { CardAssignmentDto, MemberDto } from "../../contracts";

export const toMemberResponse = (member: any): MemberDto => ({
    id: member.id,
    name: member.name,
    nim: member.nim,
    major: member.major,
    cardUid: member.cardUid ?? undefined,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
});

export const toCardAssignmentResponse = (assignment: CardAssignment): CardAssignmentDto => ({
    id: assignment.id,
    memberId: assignment.memberId,
    cardUid: assignment.cardUid,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
});
