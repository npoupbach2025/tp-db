-- ============================================================
-- Triggers pour les règles métier
-- ============================================================
USE concours_dessins;

DELIMITER //

-- ============================================================
-- TRIGGER 1 : Empêcher un compétiteur de déposer > 3 dessins dans un concours
-- ============================================================
CREATE TRIGGER trg_max_3_dessins_par_competiteur
BEFORE INSERT ON DESSIN
FOR EACH ROW
BEGIN
    DECLARE nb_dessins INT;
    SELECT COUNT(*) INTO nb_dessins
    FROM DESSIN
    WHERE numCompetiteur = NEW.numCompetiteur
      AND numConcours = NEW.numConcours;
    IF nb_dessins >= 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un compétiteur ne peut pas déposer plus de 3 dessins dans un même concours.';
    END IF;
END //

-- ============================================================
-- TRIGGER 2 : Empêcher un évaluateur d'évaluer > 8 dessins dans un concours
-- ============================================================
CREATE TRIGGER trg_max_8_evaluations_par_evaluateur
BEFORE INSERT ON EVALUATION
FOR EACH ROW
BEGIN
    DECLARE nb_evals INT;
    DECLARE v_numConcours INT;
    
    SELECT numConcours INTO v_numConcours
    FROM DESSIN WHERE numDessin = NEW.numDessin;
    
    SELECT COUNT(*) INTO nb_evals
    FROM EVALUATION ev
    JOIN DESSIN d ON ev.numDessin = d.numDessin
    WHERE ev.numEvaluateur = NEW.numEvaluateur
      AND d.numConcours = v_numConcours;
    
    IF nb_evals >= 8 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un évaluateur ne peut pas évaluer plus de 8 dessins dans un même concours.';
    END IF;
END //

-- ============================================================
-- TRIGGER 3 : Empêcher qu'un dessin ait plus de 2 évaluations
-- ============================================================
CREATE TRIGGER trg_max_2_evaluations_par_dessin
BEFORE INSERT ON EVALUATION
FOR EACH ROW
BEGIN
    DECLARE nb_evals_dessin INT;
    SELECT COUNT(*) INTO nb_evals_dessin
    FROM EVALUATION
    WHERE numDessin = NEW.numDessin;
    IF nb_evals_dessin >= 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un dessin ne peut pas avoir plus de 2 évaluations (jury de 2).';
    END IF;
END //

-- ============================================================
-- TRIGGER 4 : Empêcher le président d'un concours d'être compétiteur du même concours
-- ============================================================
CREATE TRIGGER trg_president_pas_competiteur
BEFORE INSERT ON INSCRIPTION_COMPETITEUR_CONCOURS
FOR EACH ROW
BEGIN
    DECLARE v_president INT;
    SELECT numPresident INTO v_president
    FROM CONCOURS WHERE numConcours = NEW.numConcours;
    IF NEW.numCompetiteur = v_president THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Le président d un concours ne peut pas être compétiteur de ce même concours.';
    END IF;
END //

-- ============================================================
-- TRIGGER 5 : Empêcher un évaluateur de concourir dans le même concours
--             (un évaluateur inscrit ne peut pas s'inscrire comme compétiteur)
-- ============================================================
CREATE TRIGGER trg_evaluateur_pas_competiteur
BEFORE INSERT ON INSCRIPTION_COMPETITEUR_CONCOURS
FOR EACH ROW
BEGIN
    DECLARE nb_eval INT;
    SELECT COUNT(*) INTO nb_eval
    FROM INSCRIPTION_EVALUATEUR_CONCOURS
    WHERE numEvaluateur = NEW.numCompetiteur
      AND numConcours = NEW.numConcours;
    IF nb_eval > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un évaluateur d un concours ne peut pas concourir dans ce même concours.';
    END IF;
END //

DELIMITER ;
