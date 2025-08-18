import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("researcher"),
});

export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  rowCount: integer("row_count"),
  columnCount: integer("column_count"),
  features: jsonb("features"),
  targetColumn: text("target_column"),
  dataQuality: jsonb("data_quality"),
  preprocessingSteps: jsonb("preprocessing_steps"),
});

export const models = pgTable("models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  algorithm: text("algorithm").notNull(),
  datasetId: varchar("dataset_id").references(() => datasets.id),
  hyperparameters: jsonb("hyperparameters"),
  trainingStatus: text("training_status").default("pending"),
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),
  mcc: real("mcc"),
  confusionMatrix: jsonb("confusion_matrix"),
  featureImportance: jsonb("feature_importance"),
  modelPath: text("model_path"),
  createdAt: timestamp("created_at").defaultNow(),
  trainedBy: varchar("trained_by").references(() => users.id),
});

export const quantumExperiments = pgTable("quantum_experiments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  algorithm: text("algorithm").notNull(),
  qubits: integer("qubits"),
  circuits: jsonb("circuits"),
  results: jsonb("results"),
  optimizationResults: jsonb("optimization_results"),
  executionTime: real("execution_time"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const rlAgents = pgTable("rl_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  algorithm: text("algorithm").notNull(),
  environment: text("environment").notNull(),
  hyperparameters: jsonb("hyperparameters"),
  trainingProgress: jsonb("training_progress"),
  performance: jsonb("performance"),
  modelPath: text("model_path"),
  status: text("status").default("training"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const federatedNodes = pgTable("federated_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nodeId: text("node_id").notNull().unique(),
  publicKey: text("public_key").notNull(),
  status: text("status").default("offline"),
  lastSeen: timestamp("last_seen"),
  reputation: real("reputation").default(0),
  computeCapacity: jsonb("compute_capacity"),
  blockchainAddress: text("blockchain_address"),
  stakeAmount: real("stake_amount").default(0),
});

export const federatedJobs = pgTable("federated_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  modelType: text("model_type").notNull(),
  globalModel: jsonb("global_model"),
  rounds: integer("rounds").default(0),
  participatingNodes: jsonb("participating_nodes"),
  aggregationResults: jsonb("aggregation_results"),
  blockchainHashes: jsonb("blockchain_hashes"),
  status: text("status").default("preparing"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const nlpAnalysis = pgTable("nlp_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: text("document_id").notNull(),
  documentType: text("document_type").notNull(),
  content: text("content").notNull(),
  extractedFeatures: jsonb("extracted_features"),
  sentiment: real("sentiment"),
  complexity: real("complexity"),
  topics: jsonb("topics"),
  entities: jsonb("entities"),
  embeddings: jsonb("embeddings"),
  processedAt: timestamp("processed_at").defaultNow(),
});

export const monitoringMetrics = pgTable("monitoring_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: text("source").notNull(),
  metricType: text("metric_type").notNull(),
  value: real("value").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertDatasetSchema = createInsertSchema(datasets).omit({ id: true, uploadedAt: true });
export const insertModelSchema = createInsertSchema(models).omit({ id: true, createdAt: true });
export const insertQuantumExperimentSchema = createInsertSchema(quantumExperiments).omit({ id: true, createdAt: true });
export const insertRlAgentSchema = createInsertSchema(rlAgents).omit({ id: true, createdAt: true });
export const insertFederatedNodeSchema = createInsertSchema(federatedNodes).omit({ id: true });
export const insertFederatedJobSchema = createInsertSchema(federatedJobs).omit({ id: true, createdAt: true });
export const insertNlpAnalysisSchema = createInsertSchema(nlpAnalysis).omit({ id: true, processedAt: true });
export const insertMonitoringMetricSchema = createInsertSchema(monitoringMetrics).omit({ id: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type QuantumExperiment = typeof quantumExperiments.$inferSelect;
export type InsertQuantumExperiment = z.infer<typeof insertQuantumExperimentSchema>;
export type RlAgent = typeof rlAgents.$inferSelect;
export type InsertRlAgent = z.infer<typeof insertRlAgentSchema>;
export type FederatedNode = typeof federatedNodes.$inferSelect;
export type InsertFederatedNode = z.infer<typeof insertFederatedNodeSchema>;
export type FederatedJob = typeof federatedJobs.$inferSelect;
export type InsertFederatedJob = z.infer<typeof insertFederatedJobSchema>;
export type NlpAnalysis = typeof nlpAnalysis.$inferSelect;
export type InsertNlpAnalysis = z.infer<typeof insertNlpAnalysisSchema>;
export type MonitoringMetric = typeof monitoringMetrics.$inferSelect;
export type InsertMonitoringMetric = z.infer<typeof insertMonitoringMetricSchema>;
