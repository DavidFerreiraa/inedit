import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	pgTableCreator,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `pg-drizzle_${name}`);

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);

export const user = createTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = createTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = createTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const userRelations = relations(user, ({ many }) => ({
	account: many(account),
	session: many(session),
	sources: many(sources),
	questions: many(questions),
	userAnswers: many(userAnswers),
	bookmarks: many(bookmarks),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// ============================================================================
// BANCA FEATURE - ENUMS
// ============================================================================

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const sourceTypeEnum = pgEnum("source_type", ["file", "url", "text"]);
export const questionStatusEnum = pgEnum("question_status", [
	"draft",
	"published",
	"archived",
]);
export const fileProcessingStatusEnum = pgEnum("file_processing_status", [
	"pending",
	"processing",
	"completed",
	"failed",
]);

// ============================================================================
// BANCAS TABLE - Exam board metadata
// ============================================================================

export const bancas = createTable("banca", (d) => ({
	id: d.varchar("id", { length: 50 }).primaryKey(), // e.g., "cebraspe", "fgv"
	name: d.varchar("name", { length: 255 }).notNull(), // e.g., "CEBRASPE", "FGV"
	description: d.text("description"),
	logoUrl: d.text("logo_url"),
	isActive: d
		.boolean("is_active")
		.$defaultFn(() => true)
		.notNull(),
	createdAt: d
		.timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: d
		.timestamp("updated_at", { withTimezone: true })
		.$onUpdate(() => new Date()),
}));

// ============================================================================
// SOURCES TABLE - User-uploaded materials
// ============================================================================

export const sources = createTable(
	"source",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		bancaId: d
			.varchar({ length: 50 })
			.notNull()
			.references(() => bancas.id, { onDelete: "cascade" }),
		type: sourceTypeEnum().notNull(),

		// Source content based on type
		title: d.varchar({ length: 500 }).notNull(),
		content: d.text(), // For "text" type sources
		url: d.text(), // For "url" type sources

		// File upload metadata (for "file" type)
		blobUrl: d.text(), // Vercel Blob Storage URL
		blobKey: d.text(), // Blob key for deletion
		fileName: d.varchar({ length: 500 }),
		fileSize: d.integer(), // in bytes
		mimeType: d.varchar({ length: 100 }),

		// Processing status
		processingStatus: fileProcessingStatusEnum()
			.$defaultFn(() => "pending")
			.notNull(),
		processingError: d.text(),
		processedAt: d.timestamp({ withTimezone: true }),

		// Extracted content (after processing)
		extractedText: d.text(),
		metadata: jsonb().$type<{
			pageCount?: number;
			wordCount?: number;
			characterCount?: number;
			language?: string;
			custom?: Record<string, unknown>;
		}>(),

		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("source_user_idx").on(t.userId),
		index("source_banca_idx").on(t.bancaId),
		index("source_type_idx").on(t.type),
		index("source_processing_status_idx").on(t.processingStatus),
	],
);

// ============================================================================
// QUESTIONS TABLE - AI-generated questions
// ============================================================================

export const questions = createTable(
	"question",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		bancaId: d
			.varchar({ length: 50 })
			.notNull()
			.references(() => bancas.id, { onDelete: "cascade" }),

		// Question content
		title: d.text().notNull(),
		description: d.text(), // Optional context/scenario
		difficulty: difficultyEnum().notNull(),
		status: questionStatusEnum()
			.$defaultFn(() => "published")
			.notNull(),

		// Tags for categorization
		tags: jsonb()
			.$type<string[]>()
			.$defaultFn(() => []),

		// AI generation metadata
		generatedFromSourceIds: jsonb().$type<number[]>(), // References to sources used
		aiPrompt: d.text(), // Store the prompt used for generation
		aiModel: d
			.varchar({ length: 100 })
			.$defaultFn(() => "claude-sonnet-4-20250514"),
		aiTokensUsed: d.integer(),

		// Question explanation
		explanation: d.text(), // Detailed explanation of the answer

		// Statistics
		timesAnswered: d
			.integer()
			.$defaultFn(() => 0)
			.notNull(),
		correctAnswerRate: d
			.integer()
			.$defaultFn(() => 0)
			.notNull(), // Percentage 0-100

		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("question_user_idx").on(t.userId),
		index("question_banca_idx").on(t.bancaId),
		index("question_difficulty_idx").on(t.difficulty),
		index("question_status_idx").on(t.status),
		index("question_created_at_idx").on(t.createdAt),
	],
);

// ============================================================================
// QUESTION OPTIONS TABLE - Answer choices
// ============================================================================

export const questionOptions = createTable(
	"question_option",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		questionId: d
			.integer()
			.notNull()
			.references(() => questions.id, { onDelete: "cascade" }),

		// For CEBRASPE-style questions (Certo/Errado)
		label: d.varchar({ length: 50 }).notNull(), // "Certo" or "Errado"
		isCorrect: d.boolean().notNull(),

		// Order for display
		displayOrder: d
			.integer()
			.$defaultFn(() => 0)
			.notNull(),

		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("question_option_question_idx").on(t.questionId),
		index("question_option_display_order_idx").on(t.displayOrder),
	],
);

// ============================================================================
// USER ANSWERS TABLE - Track user responses
// ============================================================================

export const userAnswers = createTable(
	"user_answer",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		questionId: d
			.integer()
			.notNull()
			.references(() => questions.id, { onDelete: "cascade" }),
		selectedOptionId: d
			.integer()
			.notNull()
			.references(() => questionOptions.id, { onDelete: "cascade" }),

		isCorrect: d.boolean().notNull(),

		// Time spent answering (in seconds)
		timeSpentSeconds: d.integer(),

		answeredAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("user_answer_user_idx").on(t.userId),
		index("user_answer_question_idx").on(t.questionId),
		index("user_answer_answered_at_idx").on(t.answeredAt),
	],
);

// ============================================================================
// BOOKMARKS TABLE - Saved questions
// ============================================================================

export const bookmarks = createTable(
	"bookmark",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		questionId: d
			.integer()
			.notNull()
			.references(() => questions.id, { onDelete: "cascade" }),

		// Optional note about why bookmarked
		note: d.text(),

		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("bookmark_user_idx").on(t.userId),
		index("bookmark_question_idx").on(t.questionId),
		// Unique constraint to prevent duplicate bookmarks
		index("bookmark_user_question_unique_idx").on(t.userId, t.questionId),
	],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const bancasRelations = relations(bancas, ({ many }) => ({
	sources: many(sources),
	questions: many(questions),
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
	user: one(user, { fields: [sources.userId], references: [user.id] }),
	banca: one(bancas, { fields: [sources.bancaId], references: [bancas.id] }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
	user: one(user, { fields: [questions.userId], references: [user.id] }),
	banca: one(bancas, { fields: [questions.bancaId], references: [bancas.id] }),
	options: many(questionOptions),
	userAnswers: many(userAnswers),
	bookmarks: many(bookmarks),
}));

export const questionOptionsRelations = relations(
	questionOptions,
	({ one, many }) => ({
		question: one(questions, {
			fields: [questionOptions.questionId],
			references: [questions.id],
		}),
		userAnswers: many(userAnswers),
	}),
);

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
	user: one(user, { fields: [userAnswers.userId], references: [user.id] }),
	question: one(questions, {
		fields: [userAnswers.questionId],
		references: [questions.id],
	}),
	selectedOption: one(questionOptions, {
		fields: [userAnswers.selectedOptionId],
		references: [questionOptions.id],
	}),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
	user: one(user, { fields: [bookmarks.userId], references: [user.id] }),
	question: one(questions, {
		fields: [bookmarks.questionId],
		references: [questions.id],
	}),
}));
