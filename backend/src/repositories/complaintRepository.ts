import { PrismaClient, Prisma } from "@prisma/client";
import { ClassificationResult, FIRData } from "../types";

const prisma = new PrismaClient();

export const complaintRepository = {
    async saveComplaint(data: {
        transcript: string;
        language: string;
        classification: ClassificationResult;
    }) {
        return prisma.complaint.create({
            data: {
                transcript: data.transcript,
                language: data.language,
                offenceCategory: data.classification.offence_category,
                bnsSections: data.classification.bns_sections,
                isCognizable: data.classification.is_cognizable,
                firMandatory: data.classification.fir_mandatory,
                status: "classified",
            },
        });
    },

    async updateComplaintWithFir(id: string, firData: FIRData) {
        return prisma.complaint.update({
            where: { id },
            data: {
                firDraft: firData as unknown as Prisma.InputJsonValue,
                status: "drafted",
            },
        });
    },

    async updateComplaintStatus(id: string, status: string) {
        return prisma.complaint.update({
            where: { id },
            data: { status },
        });
    },

    async findComplaintById(id: string) {
        return prisma.complaint.findUnique({
            where: { id },
        });
    },
};
