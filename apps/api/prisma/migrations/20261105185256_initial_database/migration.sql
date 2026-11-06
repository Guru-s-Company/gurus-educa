-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('COMPLETED', 'WAITLIST', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'POSTPONED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'JUSTIFIED_ABSENCE');

-- CreateEnum
CREATE TYPE "SubmissionMode" AS ENUM ('INDIVIDUAL', 'GROUP');

-- CreateEnum
CREATE TYPE "OrganizationVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "OrganizationJoinPolicy" AS ENUM ('OPEN', 'APPROVAL', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "OrganizationMemberStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');

-- CreateEnum
CREATE TYPE "OrganizationPermissionCode" AS ENUM ('MANAGE_ORGANIZATION', 'MANAGE_MEMBERS', 'INVITE_MEMBERS', 'MANAGE_ROLES', 'CREATE_CHANNELS', 'MANAGE_CHANNELS', 'SEND_MESSAGES', 'ATTACH_FILES', 'MANAGE_MESSAGES', 'CREATE_PROJECTS', 'MANAGE_PROJECTS', 'MANAGE_TASKS');

-- CreateEnum
CREATE TYPE "ChannelPermissionCode" AS ENUM ('VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'MANAGE_CHANNEL');

-- CreateEnum
CREATE TYPE "OrganizationJoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('PRIVATE', 'ORGANIZATION', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ProjectMemberStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');

-- CreateEnum
CREATE TYPE "ProjectPermissionCode" AS ENUM ('MANAGE_PROJECT', 'MANAGE_MEMBERS', 'INVITE_COLLABORATORS', 'EDIT_DESCRIPTION', 'UPLOAD_FILES', 'DELETE_FILES', 'MANAGE_VERSIONS', 'MANAGE_TASKS', 'REVIEW_CONTRIBUTIONS', 'PUBLISH_PROJECT', 'VIEW_HISTORY');

-- CreateEnum
CREATE TYPE "ProjectContributionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "WorkItemStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" INTEGER,

    CONSTRAINT "ClassGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "code" "RoleCode" NOT NULL,
    "description" TEXT,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "canCreateClassGroups" BOOLEAN NOT NULL DEFAULT false,
    "canCreateActivities" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" SERIAL NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" SERIAL NOT NULL,
    "classGroupId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classGroupId" INTEGER NOT NULL,
    "classSubjectId" INTEGER,
    "createdById" INTEGER,

    CONSTRAINT "LearningContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAttachment" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" INTEGER NOT NULL,

    CONSTRAINT "ContentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "meetingUrl" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classGroupId" INTEGER NOT NULL,
    "classSubjectId" INTEGER,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "allowLateSubmissions" BOOLEAN NOT NULL DEFAULT false,
    "maxPoints" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "submissionMode" "SubmissionMode" NOT NULL DEFAULT 'INDIVIDUAL',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "classSubjectId" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" SERIAL NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "textAnswer" TEXT,
    "grade" DECIMAL(5,2),
    "feedback" TEXT,
    "activityId" INTEGER NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionMember" (
    "submissionId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "enrollmentId" INTEGER NOT NULL,

    CONSTRAINT "SubmissionMember_pkey" PRIMARY KEY ("submissionId","enrollmentId")
);

-- CreateTable
CREATE TABLE "SubmissionAttachment" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "SubmissionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "enrollmentId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" "OrganizationVisibility" NOT NULL DEFAULT 'PRIVATE',
    "joinPolicy" "OrganizationJoinPolicy" NOT NULL DEFAULT 'INVITE_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "ownerId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "contextEnrollmentId" INTEGER,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "status" "OrganizationMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRolePermission" (
    "roleId" INTEGER NOT NULL,
    "permission" "OrganizationPermissionCode" NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OrganizationRolePermission_pkey" PRIMARY KEY ("roleId","permission")
);

-- CreateTable
CREATE TABLE "OrganizationMemberPermission" (
    "memberId" INTEGER NOT NULL,
    "permission" "OrganizationPermissionCode" NOT NULL,
    "allowed" BOOLEAN NOT NULL,

    CONSTRAINT "OrganizationMemberPermission_pkey" PRIMARY KEY ("memberId","permission")
);

-- CreateTable
CREATE TABLE "OrganizationInvite" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdByMemberId" INTEGER NOT NULL,
    "targetUserId" INTEGER,
    "targetEmail" TEXT,
    "tokenHash" TEXT NOT NULL,
    "maxUses" INTEGER,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationJoinRequest" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT,
    "status" "OrganizationJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "reviewedByMemberId" INTEGER,

    CONSTRAINT "OrganizationJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationChannel" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdByMemberId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationChannelRolePermission" (
    "channelId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permission" "ChannelPermissionCode" NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OrganizationChannelRolePermission_pkey" PRIMARY KEY ("channelId","roleId","permission")
);

-- CreateTable
CREATE TABLE "ChannelMessage" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "authorMemberId" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChannelMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMessageAttachment" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMessageMention" (
    "messageId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMessageMention_pkey" PRIMARY KEY ("messageId","userId")
);

-- CreateTable
CREATE TABLE "DirectConversation" (
    "id" SERIAL NOT NULL,
    "userAId" INTEGER NOT NULL,
    "userBId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessageAttachment" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "ProjectVisibility" NOT NULL DEFAULT 'PRIVATE',
    "allowDownload" BOOLEAN NOT NULL DEFAULT false,
    "allowContributionRequests" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER NOT NULL,
    "ownerUserId" INTEGER,
    "organizationId" INTEGER,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRole" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "status" "ProjectMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectRolePermission" (
    "roleId" INTEGER NOT NULL,
    "permission" "ProjectPermissionCode" NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProjectRolePermission_pkey" PRIMARY KEY ("roleId","permission")
);

-- CreateTable
CREATE TABLE "ProjectMemberPermission" (
    "memberId" INTEGER NOT NULL,
    "permission" "ProjectPermissionCode" NOT NULL,
    "allowed" BOOLEAN NOT NULL,

    CONSTRAINT "ProjectMemberPermission_pkey" PRIMARY KEY ("memberId","permission")
);

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "description" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFile" (
    "id" SERIAL NOT NULL,
    "versionId" INTEGER NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectContributionRequest" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "reviewedById" INTEGER,
    "message" TEXT NOT NULL,
    "status" "ProjectContributionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectContributionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectContributionAttachment" (
    "id" SERIAL NOT NULL,
    "requestId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" BIGINT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectContributionAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationTask" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdByMemberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkItemStatus" NOT NULL DEFAULT 'TODO',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationTaskAssignee" (
    "taskId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationTaskAssignee_pkey" PRIMARY KEY ("taskId","memberId")
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkItemStatus" NOT NULL DEFAULT 'TODO',
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTaskAssignee" (
    "taskId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTaskAssignee_pkey" PRIMARY KEY ("taskId","memberId")
);

-- CreateTable
CREATE TABLE "ProjectLike" (
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLike_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "ProjectFavorite" (
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectFavorite_pkey" PRIMARY KEY ("projectId","userId")
);

-- CreateTable
CREATE TABLE "OrganizationEvent" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "actorMemberId" INTEGER,
    "eventType" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEvent" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "actorId" INTEGER,
    "eventType" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGroup_code_key" ON "ClassGroup"("code");

-- CreateIndex
CREATE INDEX "ClassGroup_teacherId_idx" ON "ClassGroup"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "Enrollment_classId_idx" ON "Enrollment"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_classId_key" ON "Enrollment"("userId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "ClassSubject_subjectId_idx" ON "ClassSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_classGroupId_subjectId_key" ON "ClassSubject"("classGroupId", "subjectId");

-- CreateIndex
CREATE INDEX "LearningContent_classGroupId_idx" ON "LearningContent"("classGroupId");

-- CreateIndex
CREATE INDEX "LearningContent_classSubjectId_idx" ON "LearningContent"("classSubjectId");

-- CreateIndex
CREATE INDEX "LearningContent_createdById_idx" ON "LearningContent"("createdById");

-- CreateIndex
CREATE INDEX "ContentAttachment_contentId_idx" ON "ContentAttachment"("contentId");

-- CreateIndex
CREATE INDEX "ClassSession_classGroupId_idx" ON "ClassSession"("classGroupId");

-- CreateIndex
CREATE INDEX "ClassSession_classSubjectId_idx" ON "ClassSession"("classSubjectId");

-- CreateIndex
CREATE INDEX "Activity_classSubjectId_idx" ON "Activity"("classSubjectId");

-- CreateIndex
CREATE INDEX "Submission_activityId_idx" ON "Submission"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_id_activityId_key" ON "Submission"("id", "activityId");

-- CreateIndex
CREATE INDEX "SubmissionMember_enrollmentId_idx" ON "SubmissionMember"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionMember_activityId_enrollmentId_key" ON "SubmissionMember"("activityId", "enrollmentId");

-- CreateIndex
CREATE INDEX "SubmissionAttachment_submissionId_idx" ON "SubmissionAttachment"("submissionId");

-- CreateIndex
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_enrollmentId_sessionId_key" ON "Attendance"("enrollmentId", "sessionId");

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- CreateIndex
CREATE INDEX "Organization_contextEnrollmentId_idx" ON "Organization"("contextEnrollmentId");

-- CreateIndex
CREATE INDEX "Organization_visibility_deletedAt_idx" ON "Organization"("visibility", "deletedAt");

-- CreateIndex
CREATE INDEX "Organization_createdById_idx" ON "Organization"("createdById");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_status_idx" ON "OrganizationMember"("userId", "status");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_status_idx" ON "OrganizationMember"("organizationId", "status");

-- CreateIndex
CREATE INDEX "OrganizationMember_roleId_idx" ON "OrganizationMember"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationRole_organizationId_isDefault_idx" ON "OrganizationRole"("organizationId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_organizationId_name_key" ON "OrganizationRole"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvite_tokenHash_key" ON "OrganizationInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "OrganizationInvite_organizationId_revokedAt_idx" ON "OrganizationInvite"("organizationId", "revokedAt");

-- CreateIndex
CREATE INDEX "OrganizationInvite_targetUserId_idx" ON "OrganizationInvite"("targetUserId");

-- CreateIndex
CREATE INDEX "OrganizationInvite_createdByMemberId_idx" ON "OrganizationInvite"("createdByMemberId");

-- CreateIndex
CREATE INDEX "OrganizationJoinRequest_organizationId_userId_status_idx" ON "OrganizationJoinRequest"("organizationId", "userId", "status");

-- CreateIndex
CREATE INDEX "OrganizationJoinRequest_userId_idx" ON "OrganizationJoinRequest"("userId");

-- CreateIndex
CREATE INDEX "OrganizationJoinRequest_reviewedByMemberId_idx" ON "OrganizationJoinRequest"("reviewedByMemberId");

-- CreateIndex
CREATE INDEX "OrganizationChannel_organizationId_archivedAt_idx" ON "OrganizationChannel"("organizationId", "archivedAt");

-- CreateIndex
CREATE INDEX "OrganizationChannel_createdByMemberId_idx" ON "OrganizationChannel"("createdByMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationChannel_organizationId_name_key" ON "OrganizationChannel"("organizationId", "name");

-- CreateIndex
CREATE INDEX "OrganizationChannelRolePermission_roleId_idx" ON "OrganizationChannelRolePermission"("roleId");

-- CreateIndex
CREATE INDEX "ChannelMessage_channelId_createdAt_idx" ON "ChannelMessage"("channelId", "createdAt");

-- CreateIndex
CREATE INDEX "ChannelMessage_authorMemberId_idx" ON "ChannelMessage"("authorMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMessageAttachment_storageKey_key" ON "ChannelMessageAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "ChannelMessageAttachment_messageId_idx" ON "ChannelMessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "ChannelMessageMention_userId_createdAt_idx" ON "ChannelMessageMention"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DirectConversation_userBId_idx" ON "DirectConversation"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectConversation_userAId_userBId_key" ON "DirectConversation"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "DirectMessage_conversationId_createdAt_idx" ON "DirectMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "DirectMessage_authorId_idx" ON "DirectMessage"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessageAttachment_storageKey_key" ON "DirectMessageAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "DirectMessageAttachment_messageId_idx" ON "DirectMessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "Project_ownerUserId_idx" ON "Project"("ownerUserId");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_visibility_deletedAt_idx" ON "Project"("visibility", "deletedAt");

-- CreateIndex
CREATE INDEX "Project_createdById_idx" ON "Project"("createdById");

-- CreateIndex
CREATE INDEX "ProjectRole_projectId_isDefault_idx" ON "ProjectRole"("projectId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRole_projectId_name_key" ON "ProjectRole"("projectId", "name");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_status_idx" ON "ProjectMember"("userId", "status");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_status_idx" ON "ProjectMember"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectMember_roleId_idx" ON "ProjectMember"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectVersion_projectId_createdAt_idx" ON "ProjectVersion"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectVersion_createdById_idx" ON "ProjectVersion"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVersion_projectId_versionNumber_key" ON "ProjectVersion"("projectId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFile_storageKey_key" ON "ProjectFile"("storageKey");

-- CreateIndex
CREATE INDEX "ProjectFile_versionId_idx" ON "ProjectFile"("versionId");

-- CreateIndex
CREATE INDEX "ProjectFile_isCurrent_removedAt_idx" ON "ProjectFile"("isCurrent", "removedAt");

-- CreateIndex
CREATE INDEX "ProjectFile_uploadedById_idx" ON "ProjectFile"("uploadedById");

-- CreateIndex
CREATE INDEX "ProjectContributionRequest_projectId_status_createdAt_idx" ON "ProjectContributionRequest"("projectId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectContributionRequest_requesterId_idx" ON "ProjectContributionRequest"("requesterId");

-- CreateIndex
CREATE INDEX "ProjectContributionRequest_reviewedById_idx" ON "ProjectContributionRequest"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectContributionAttachment_storageKey_key" ON "ProjectContributionAttachment"("storageKey");

-- CreateIndex
CREATE INDEX "ProjectContributionAttachment_requestId_idx" ON "ProjectContributionAttachment"("requestId");

-- CreateIndex
CREATE INDEX "OrganizationTask_organizationId_status_idx" ON "OrganizationTask"("organizationId", "status");

-- CreateIndex
CREATE INDEX "OrganizationTask_dueAt_idx" ON "OrganizationTask"("dueAt");

-- CreateIndex
CREATE INDEX "OrganizationTask_createdByMemberId_idx" ON "OrganizationTask"("createdByMemberId");

-- CreateIndex
CREATE INDEX "OrganizationTaskAssignee_memberId_idx" ON "OrganizationTaskAssignee"("memberId");

-- CreateIndex
CREATE INDEX "ProjectTask_projectId_status_idx" ON "ProjectTask"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectTask_dueAt_idx" ON "ProjectTask"("dueAt");

-- CreateIndex
CREATE INDEX "ProjectTask_createdById_idx" ON "ProjectTask"("createdById");

-- CreateIndex
CREATE INDEX "ProjectTaskAssignee_memberId_idx" ON "ProjectTaskAssignee"("memberId");

-- CreateIndex
CREATE INDEX "ProjectLike_userId_createdAt_idx" ON "ProjectLike"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectFavorite_userId_createdAt_idx" ON "ProjectFavorite"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OrganizationEvent_organizationId_createdAt_idx" ON "OrganizationEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "OrganizationEvent_actorMemberId_idx" ON "OrganizationEvent"("actorMemberId");

-- CreateIndex
CREATE INDEX "ProjectEvent_projectId_createdAt_idx" ON "ProjectEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ProjectEvent_actorId_idx" ON "ProjectEvent"("actorId");

-- AddForeignKey
ALTER TABLE "ClassGroup" ADD CONSTRAINT "ClassGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningContent" ADD CONSTRAINT "LearningContent_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningContent" ADD CONSTRAINT "LearningContent_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningContent" ADD CONSTRAINT "LearningContent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAttachment" ADD CONSTRAINT "ContentAttachment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "LearningContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_classGroupId_fkey" FOREIGN KEY ("classGroupId") REFERENCES "ClassGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionMember" ADD CONSTRAINT "SubmissionMember_submissionId_activityId_fkey" FOREIGN KEY ("submissionId", "activityId") REFERENCES "Submission"("id", "activityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionMember" ADD CONSTRAINT "SubmissionMember_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_contextEnrollmentId_fkey" FOREIGN KEY ("contextEnrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRolePermission" ADD CONSTRAINT "OrganizationRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMemberPermission" ADD CONSTRAINT "OrganizationMemberPermission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "OrganizationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvite" ADD CONSTRAINT "OrganizationInvite_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationJoinRequest" ADD CONSTRAINT "OrganizationJoinRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationJoinRequest" ADD CONSTRAINT "OrganizationJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationJoinRequest" ADD CONSTRAINT "OrganizationJoinRequest_reviewedByMemberId_fkey" FOREIGN KEY ("reviewedByMemberId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationChannel" ADD CONSTRAINT "OrganizationChannel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationChannel" ADD CONSTRAINT "OrganizationChannel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationChannelRolePermission" ADD CONSTRAINT "OrganizationChannelRolePermission_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "OrganizationChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationChannelRolePermission" ADD CONSTRAINT "OrganizationChannelRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "OrganizationRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "OrganizationChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_authorMemberId_fkey" FOREIGN KEY ("authorMemberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessageAttachment" ADD CONSTRAINT "ChannelMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChannelMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessageMention" ADD CONSTRAINT "ChannelMessageMention_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChannelMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessageMention" ADD CONSTRAINT "ChannelMessageMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectConversation" ADD CONSTRAINT "DirectConversation_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectConversation" ADD CONSTRAINT "DirectConversation_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "DirectConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessageAttachment" ADD CONSTRAINT "DirectMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "DirectMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRole" ADD CONSTRAINT "ProjectRole_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ProjectRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectRolePermission" ADD CONSTRAINT "ProjectRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ProjectRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberPermission" ADD CONSTRAINT "ProjectMemberPermission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContributionRequest" ADD CONSTRAINT "ProjectContributionRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContributionRequest" ADD CONSTRAINT "ProjectContributionRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContributionRequest" ADD CONSTRAINT "ProjectContributionRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContributionAttachment" ADD CONSTRAINT "ProjectContributionAttachment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ProjectContributionRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTask" ADD CONSTRAINT "OrganizationTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTask" ADD CONSTRAINT "OrganizationTask_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTaskAssignee" ADD CONSTRAINT "OrganizationTaskAssignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OrganizationTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationTaskAssignee" ADD CONSTRAINT "OrganizationTaskAssignee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTaskAssignee" ADD CONSTRAINT "ProjectTaskAssignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTaskAssignee" ADD CONSTRAINT "ProjectTaskAssignee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLike" ADD CONSTRAINT "ProjectLike_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLike" ADD CONSTRAINT "ProjectLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFavorite" ADD CONSTRAINT "ProjectFavorite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFavorite" ADD CONSTRAINT "ProjectFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationEvent" ADD CONSTRAINT "OrganizationEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationEvent" ADD CONSTRAINT "OrganizationEvent_actorMemberId_fkey" FOREIGN KEY ("actorMemberId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Projeto: exatamente UM dono (usuário OU organização).
ALTER TABLE "Project"
  ADD CONSTRAINT "project_exactly_one_owner"
  CHECK (num_nonnulls("ownerUserId", "organizationId") = 1);

-- Garante que a visibilidade de "Organização" só seja possível em projetos de organização.
ALTER TABLE "Project"
  ADD CONSTRAINT "project_organization_visibility_requires_organization"
  CHECK (
    "visibility" <> 'ORGANIZATION'
    OR "organizationId" IS NOT NULL
  );

-- Conversa direta: ordem normalizada (A < B). Impede conversa consigo mesmo e a
-- duplicata espelhada (A,B) + (B,A). O backend ordena os IDs antes do insert.
ALTER TABLE "DirectConversation"
  ADD CONSTRAINT "direct_conversation_ordered_users"
  CHECK ("userAId" < "userBId");

-- No máximo UM pedido PENDENTE por usuário em cada organização.
CREATE UNIQUE INDEX "org_join_request_one_pending"
  ON "OrganizationJoinRequest" ("organizationId", "userId")
  WHERE "status" = 'PENDING';

-- No máximo UM papel padrão (o que é atribuído a quem entra) por organização e por projeto.
CREATE UNIQUE INDEX "organization_role_one_default"
  ON "OrganizationRole" ("organizationId")
  WHERE "isDefault";

CREATE UNIQUE INDEX "project_role_one_default"
  ON "ProjectRole" ("projectId")
  WHERE "isDefault";

-- Teste de valores.

ALTER TABLE "ClassSession"
  ADD CONSTRAINT "class_session_end_after_start"
  CHECK ("scheduledEnd" > "scheduledStart");

ALTER TABLE "Activity"
  ADD CONSTRAINT "activity_max_points_positive"
  CHECK ("maxPoints" > 0);

ALTER TABLE "Submission"
  ADD CONSTRAINT "submission_grade_non_negative"
  CHECK ("grade" IS NULL OR "grade" >= 0);

ALTER TABLE "OrganizationInvite"
  ADD CONSTRAINT "organization_invite_uses_within_limit"
  CHECK ("useCount" >= 0 AND ("maxUses" IS NULL OR "useCount" <= "maxUses"));

ALTER TABLE "ProjectVersion"
  ADD CONSTRAINT "project_version_number_positive"
  CHECK ("versionNumber" >= 1);

-- Tamanho de arquivo nunca negativo (as 4 tabelas com sizeBytes).
ALTER TABLE "ChannelMessageAttachment"
  ADD CONSTRAINT "channel_message_attachment_size_non_negative"
  CHECK ("sizeBytes" IS NULL OR "sizeBytes" >= 0);

ALTER TABLE "DirectMessageAttachment"
  ADD CONSTRAINT "direct_message_attachment_size_non_negative"
  CHECK ("sizeBytes" IS NULL OR "sizeBytes" >= 0);

ALTER TABLE "ProjectFile"
  ADD CONSTRAINT "project_file_size_non_negative"
  CHECK ("sizeBytes" IS NULL OR "sizeBytes" >= 0);

ALTER TABLE "ProjectContributionAttachment"
  ADD CONSTRAINT "project_contribution_attachment_size_non_negative"
  CHECK ("sizeBytes" IS NULL OR "sizeBytes" >= 0);

CREATE UNIQUE INDEX "user_email_lower_key" ON "User" (lower("email"));

ALTER TABLE "OrganizationInvite"
    ADD CONSTRAINT "organization_invite_single_target"
    CHECK ("targetUserId" IS NULL OR "targetEmail" IS NULL);