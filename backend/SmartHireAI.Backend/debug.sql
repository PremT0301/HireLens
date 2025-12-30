ALTER DATABASE CHARACTER SET utf8mb4;


CREATE TABLE `users` (
    `user_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `created_at` datetime(6) NOT NULL,
    `updated_at` datetime(6) NOT NULL,
    `email` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `full_name` varchar(100) CHARACTER SET utf8mb4 NULL,
    `password_hash` varchar(255) CHARACTER SET utf8mb4 NULL,
    `google_id` varchar(100) CHARACTER SET utf8mb4 NULL,
    `auth_provider` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `is_email_verified` tinyint(1) NOT NULL,
    `verification_token` varchar(100) CHARACTER SET utf8mb4 NULL,
    `verification_token_expiry` datetime(6) NULL,
    `mobile_number` varchar(20) CHARACTER SET utf8mb4 NULL,
    `location` varchar(255) CHARACTER SET utf8mb4 NULL,
    `profile_image` varchar(255) CHARACTER SET utf8mb4 NULL,
    `role` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_users` PRIMARY KEY (`user_id`)
) CHARACTER SET=utf8mb4;


CREATE TABLE `applicants` (
    `applicant_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `current_role` varchar(100) CHARACTER SET utf8mb4 NULL,
    `experience_years` int NOT NULL,
    `address` varchar(255) CHARACTER SET utf8mb4 NULL,
    `resume_url` varchar(500) CHARACTER SET utf8mb4 NULL,
    `location` varchar(100) CHARACTER SET utf8mb4 NULL,
    `mobile_number` varchar(255) CHARACTER SET utf8mb4 NULL,
    `skills` longtext CHARACTER SET utf8mb4 NULL,
    `linkedin_url` varchar(255) CHARACTER SET utf8mb4 NULL,
    `preferred_role` varchar(100) CHARACTER SET utf8mb4 NULL,
    `preferred_location` varchar(100) CHARACTER SET utf8mb4 NULL,
    `date_of_birth` datetime(6) NULL,
    `gender` varchar(20) CHARACTER SET utf8mb4 NULL,
    `created_at` datetime(6) NOT NULL,
    `updated_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_applicants` PRIMARY KEY (`applicant_id`),
    CONSTRAINT `FK_applicants_users_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `recruiters` (
    `recruiter_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `company_name` varchar(150) CHARACTER SET utf8mb4 NULL,
    `company_logo` varchar(255) CHARACTER SET utf8mb4 NULL,
    `designation` varchar(100) CHARACTER SET utf8mb4 NULL,
    `location` varchar(100) CHARACTER SET utf8mb4 NULL,
    `mobile_number` varchar(20) CHARACTER SET utf8mb4 NULL,
    `company_website` varchar(255) CHARACTER SET utf8mb4 NULL,
    `industry` varchar(100) CHARACTER SET utf8mb4 NULL,
    `company_size` varchar(50) CHARACTER SET utf8mb4 NULL,
    `recruiter_type` varchar(50) CHARACTER SET utf8mb4 NULL,
    `created_at` datetime(6) NOT NULL,
    `updated_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_recruiters` PRIMARY KEY (`recruiter_id`),
    CONSTRAINT `FK_recruiters_users_recruiter_id` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `education` (
    `education_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `applicant_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `college_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `degree` varchar(255) CHARACTER SET utf8mb4 NULL,
    `specialization` varchar(255) CHARACTER SET utf8mb4 NULL,
    `completion_year` int NOT NULL,
    `grade` varchar(10) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_education` PRIMARY KEY (`education_id`),
    CONSTRAINT `FK_education_applicants_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `resumes` (
    `resume_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `applicant_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `parsed_at` datetime(6) NOT NULL,
    `resume_health_score` int NOT NULL,
    `resume_text` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_resumes` PRIMARY KEY (`resume_id`),
    CONSTRAINT `FK_resumes_applicants_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `work_experience` (
    `experience_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `applicant_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `company_name` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `role` varchar(255) CHARACTER SET utf8mb4 NULL,
    `duration` varchar(100) CHARACTER SET utf8mb4 NULL,
    `description` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_work_experience` PRIMARY KEY (`experience_id`),
    CONSTRAINT `FK_work_experience_applicants_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `job_descriptions` (
    `job_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `created_at` datetime(6) NOT NULL,
    `experience_required` int NOT NULL,
    `recruiter_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `required_skills` longtext CHARACTER SET utf8mb4 NULL,
    `salary_max` int NOT NULL,
    `salary_min` int NOT NULL,
    `title` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `number_of_openings` int NOT NULL,
    `status` varchar(20) CHARACTER SET utf8mb4 NOT NULL,
    `description` longtext CHARACTER SET utf8mb4 NULL,
    `department` varchar(100) CHARACTER SET utf8mb4 NULL,
    `employment_type` varchar(50) CHARACTER SET utf8mb4 NULL,
    `location` varchar(100) CHARACTER SET utf8mb4 NULL,
    `location_type` varchar(50) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_job_descriptions` PRIMARY KEY (`job_id`),
    CONSTRAINT `FK_job_descriptions_recruiters_recruiter_id` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiters` (`recruiter_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `resume_embeddings` (
    `resume_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `embedding` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_resume_embeddings` PRIMARY KEY (`resume_id`),
    CONSTRAINT `FK_resume_embeddings_resumes_resume_id` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `resume_entities` (
    `entity_id` int NOT NULL AUTO_INCREMENT,
    `confidence` float NOT NULL,
    `entity_type` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `entity_value` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `resume_id` char(36) COLLATE ascii_general_ci NOT NULL,
    CONSTRAINT `PK_resume_entities` PRIMARY KEY (`entity_id`),
    CONSTRAINT `FK_resume_entities_resumes_resume_id` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `jd_embeddings` (
    `job_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `embedding` longtext CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK_jd_embeddings` PRIMARY KEY (`job_id`),
    CONSTRAINT `FK_jd_embeddings_job_descriptions_job_id` FOREIGN KEY (`job_id`) REFERENCES `job_descriptions` (`job_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `job_applications` (
    `application_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `job_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `applicant_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `status` varchar(50) CHARACTER SET utf8mb4 NOT NULL,
    `applied_at` datetime(6) NOT NULL,
    `ats_score` float NOT NULL,
    `interview_date` datetime(6) NULL,
    `interview_mode` varchar(50) CHARACTER SET utf8mb4 NULL,
    `meeting_link` varchar(500) CHARACTER SET utf8mb4 NULL,
    `interview_accepted_at` datetime(6) NULL,
    `hired_at` datetime(6) NULL,
    CONSTRAINT `PK_job_applications` PRIMARY KEY (`application_id`),
    CONSTRAINT `FK_job_applications_applicants_applicant_id` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`applicant_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_job_applications_job_descriptions_job_id` FOREIGN KEY (`job_id`) REFERENCES `job_descriptions` (`job_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `match_results` (
    `match_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `job_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `match_score` float NOT NULL,
    `ranked_at` datetime(6) NOT NULL,
    `resume_id` char(36) COLLATE ascii_general_ci NOT NULL,
    CONSTRAINT `PK_match_results` PRIMARY KEY (`match_id`),
    CONSTRAINT `FK_match_results_job_descriptions_job_id` FOREIGN KEY (`job_id`) REFERENCES `job_descriptions` (`job_id`) ON DELETE CASCADE,
    CONSTRAINT `FK_match_results_resumes_resume_id` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`resume_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE TABLE `application_messages` (
    `message_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `application_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `sender_role` longtext CHARACTER SET utf8mb4 NOT NULL,
    `subject` varchar(200) CHARACTER SET utf8mb4 NOT NULL,
    `body` longtext CHARACTER SET utf8mb4 NOT NULL,
    `sent_at` datetime(6) NOT NULL,
    CONSTRAINT `PK_application_messages` PRIMARY KEY (`message_id`),
    CONSTRAINT `FK_application_messages_job_applications_application_id` FOREIGN KEY (`application_id`) REFERENCES `job_applications` (`application_id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;


CREATE INDEX `IX_application_messages_application_id` ON `application_messages` (`application_id`);


CREATE INDEX `IX_education_applicant_id` ON `education` (`applicant_id`);


CREATE INDEX `IX_job_applications_applicant_id` ON `job_applications` (`applicant_id`);


CREATE INDEX `IX_job_applications_job_id` ON `job_applications` (`job_id`);


CREATE INDEX `IX_job_descriptions_recruiter_id` ON `job_descriptions` (`recruiter_id`);


CREATE INDEX `IX_match_results_job_id` ON `match_results` (`job_id`);


CREATE INDEX `IX_match_results_resume_id` ON `match_results` (`resume_id`);


CREATE INDEX `IX_resume_entities_resume_id` ON `resume_entities` (`resume_id`);


CREATE INDEX `IX_resumes_applicant_id` ON `resumes` (`applicant_id`);


CREATE UNIQUE INDEX `IX_users_email` ON `users` (`email`);


CREATE INDEX `IX_work_experience_applicant_id` ON `work_experience` (`applicant_id`);


