import {MemberRepository} from "./member.repository";
import {ConflictError, NotFoundError} from "../../lib/errors";
import {normalizeCardUid} from "../../utils/util";
import type {UpdateMemberInput} from "./member.schema";

export class MemberService {
    constructor(private repository: MemberRepository) {
    }

    public getAll = async () => {
        return this.repository.findAll();
    }

    public getById = async (id: string) => {
        const member = await this.repository.findById(id);
        if (!member) {
            throw new NotFoundError('Member not found');
        }

        return member;
    }

    public create = async (name: string, nim: string, major: string) => {
        const member = await this.repository.create(name, nim, major);
        if (!member) {
            throw new ConflictError('Failed to create member');
        }

        return member;
    }

    public updateById = async (id: string, data: UpdateMemberInput) => {
        const member = await this.repository.updateById(id, data);
        if (!member) {
            throw new NotFoundError('Member not found');
        }

        return member;
    }

    public deleteById = async (id: string) => {
        const member = await this.repository.deleteById(id);
        if (!member) {
            throw new NotFoundError('Member not found');
        }

        return member;
    }

    public assignCardById = async (memberId: string, cardUidHex: string) => {
        const member = await this.repository.findById(memberId);
        if (!member) {
            throw new NotFoundError('Member not found');
        }

        const cardUidNormalized = normalizeCardUid(cardUidHex);
        const existingCardByUid = await this.repository.findCardAssignmentByUid(cardUidNormalized);
        if (existingCardByUid) {
            if (existingCardByUid.memberId === memberId) {
                return existingCardByUid; // already assigned to this member
            }
            throw new ConflictError('Card is already assigned to another member');
        }

        const existingCardByMember = await this.repository.findCardAssignmentByMemberId(memberId);

        try {
            let assignment;
            if (existingCardByMember) {
                assignment = await this.repository.updateCardAssignment(existingCardByMember.id, cardUidNormalized);
            } else {
                assignment = await this.repository.createCardAssignment(memberId, cardUidNormalized);
            }

            if (!assignment) {
                throw new ConflictError('Failed to assign card');
            }

            await this.repository.deleteUnknownScanRequestsByCardUid(cardUidNormalized);

            return assignment;
        } catch (error) {
            const dbError = error as { code?: string };
            if (dbError.code === 'ER_DUP_ENTRY') {
                throw new ConflictError('Card is already assigned');
            }

            throw error;
        }
    }

    public getCardByMemberId = async (memberId: string) => {
        const member = await this.repository.findById(memberId);
        if (!member) {
            throw new NotFoundError('Member not found');
        }

        return this.repository.findCardAssignmentByMemberId(memberId);
    }
}
