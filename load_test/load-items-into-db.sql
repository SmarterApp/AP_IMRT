DO $$
DECLARE 
	numberOfItemsToCreate INTEGER := 10000;
	newItemId INTEGER;
	newItemKey INTEGER;
	itemRow item%ROWTYPE;
BEGIN
	FOR i IN 1 .. numberOfItemsToCreate 
	LOOP
		SELECT MAX(id) + 1 INTO newItemId FROM item;

		SELECT 
			*
		INTO 
			itemRow 
		FROM 
			item 
		ORDER BY 
			RANDOM() 
		LIMIT 1;
		
		INSERT INTO item(id, 
			subject, 
			grade, 
			workflow_status, 
			item_type, 
			dok, 
			item_created_by, 
			item_created_at, 
			item_json, 
			created_at, 
			updated_by, 
			classification, 
			associated_stimulus_id, 
			workflow_status_set_at, 
			organization_type_id, 
			organization_name, 
			primary_content_domain, 
			primary_common_core_standard, 
			primary_target, 
			secondary_claim, 
			secondary_content_domain, 
			item_difficulty_quintile, 
			form_count, 
			exposures_count, 
			sight_tts_provided, 
			visual_tts_provided, 
			english_content_last_updated_at, 
			spanish_content_last_updated_at, 
			updated_at, 
			is_being_created, 
			primary_claim, 
			secondary_common_core_standard, 
			secondary_target, 
			tertiary_claim, 
			tertiary_content_domain, 
			tertiary_target, 
			quaternary_claim, 
			quaternary_content_domain, 
			quaternary_common_core_standard, 
			quaternary_target, 
			content_task_model, 
			item_author, 
			asl_required, 
			asl_provided, 
			braille_required, 
			braille_provided, 
			cc_required, 
			cc_provided, 
			translation_required, 
			translation_provided, 
			writing_purpose, 
			performance_task, 
			visual_tts_required, 
			test_category, 
			scoring_engine, 
			allow_calculator, 
			asl_uploaded_prior_to_last_content_update, 
			braille_uploaded_prior_to_last_content_update, 
			closed_captioning_uploaded_prior_to_last_content_update)
		VALUES (
			newItemId,
			itemRow.subject, 
			itemRow.grade, 
			itemRow.workflow_status, 
			itemRow.item_type, 
			itemRow.dok, 
			'load test script', -- itemRow.item_created_by, 
			itemRow.item_created_at, 
			itemRow.item_json, 
			itemRow.created_at, 
			itemRow.updated_by, 
			itemRow.classification, 
			itemRow.associated_stimulus_id, 
			itemRow.workflow_status_set_at, 
			itemRow.organization_type_id, 
			itemRow.organization_name, 
			itemRow.primary_content_domain, 
			itemRow.primary_common_core_standard, 
			itemRow.primary_target, 
			itemRow.secondary_claim, 
			itemRow.secondary_content_domain, 
			itemRow.item_difficulty_quintile, 
			itemRow.form_count, 
			itemRow.exposures_count, 
			itemRow.sight_tts_provided, 
			itemRow.visual_tts_provided, 
			itemRow.english_content_last_updated_at, 
			itemRow.spanish_content_last_updated_at, 
			itemRow.updated_at, 
			itemRow.is_being_created, 
			itemRow.primary_claim, 
			itemRow.secondary_common_core_standard, 
			itemRow.secondary_target, 
			itemRow.tertiary_claim, 
			itemRow.tertiary_content_domain, 
			itemRow.tertiary_target, 
			itemRow.quaternary_claim, 
			itemRow.quaternary_content_domain, 
			itemRow.quaternary_common_core_standard, 
			itemRow.quaternary_target, 
			itemRow.content_task_model, 
			itemRow.item_author, 
			itemRow.asl_required, 
			itemRow.asl_provided, 
			itemRow.braille_required, 
			itemRow.braille_provided, 
			itemRow.cc_required, 
			itemRow.cc_provided, 
			itemRow.translation_required, 
			itemRow.translation_provided, 
			itemRow.writing_purpose, 
			itemRow.performance_task, 
			itemRow.visual_tts_required, 
			itemRow.test_category, 
			itemRow.scoring_engine, 
			itemRow.allow_calculator, 
			itemRow.asl_uploaded_prior_to_last_content_update, 
			itemRow.braille_uploaded_prior_to_last_content_update, 
			itemRow.closed_captioning_uploaded_prior_to_last_content_update
		);
		
		SELECT key INTO newItemKey FROM item WHERE id = newItemId;
		
		INSERT INTO stim_link(item_key, item_key_stim)
		SELECT
			newItemKey,
			item_key_stim
		FROM
			stim_link
		WHERE
			item_key = itemRow.key;
		
		INSERT INTO item_attachment(item_key, file_name, file_type, uploaded_at, created_at, updated_at, updated_by)
		SELECT
			newItemKey,
			file_name,
			file_type,
			uploaded_at,
			created_at,
			updated_at,
			updated_by
		FROM
			item_attachment
		WHERE
			item_key = itemRow.key;
		
		INSERT INTO item_form(item_key, assessment_type, form_id, form_type, exposures, created_at, updated_at, updated_by)
		SELECT
			newItemKey,
			assessment_type,
			form_id,
			form_type,
			exposures,
			created_at,
			updated_at,
			updated_by
		FROM
			item_form
		WHERE
			item_key = itemRow.key;
	END LOOP;
END $$


