// src/utils/editTimeLimit.js
import dayjs from "dayjs";

/**
 * Prüft, ob ein Arbeitszeit-Eintrag noch bearbeitet werden darf
 * Einträge können nur bis zu 3 Monate nach dem Datum bearbeitet werden
 * @param {string|Date|dayjs} datum - Das Datum des Eintrags
 * @returns {boolean} - true wenn Bearbeitung erlaubt, false wenn nicht
 */
export function isEditAllowed(datum) {
  if (!datum) return false;
  
  const entryDate = dayjs(datum);
  const threeMonthsAgo = dayjs().subtract(3, 'month');
  
  // Prüfen, ob das Datum nicht älter als 3 Monate ist
  return entryDate.isAfter(threeMonthsAgo) || entryDate.isSame(threeMonthsAgo, 'day');
}

/**
 * Gibt das früheste Datum zurück, für das noch Bearbeitungen erlaubt sind
 * @returns {dayjs} - Datum vor 3 Monaten
 */
export function getEditTimeLimit() {
  return dayjs().subtract(3, 'month');
}

/**
 * Gibt eine benutzerfreundliche Fehlermeldung zurück
 * @returns {string} - Fehlermeldung
 */
export function getEditNotAllowedMessage() {
  return "Dieser Eintrag ist älter als 3 Monate und kann nicht mehr bearbeitet werden.";
}

/**
 * Prüft, ob ein Datum für neue Einträge erlaubt ist
 * @param {string|Date|dayjs} datum - Das Datum für den neuen Eintrag
 * @returns {boolean} - true wenn erlaubt, false wenn nicht
 */
export function isCreateAllowed(datum) {
  return isEditAllowed(datum);
}

export default {
  isEditAllowed,
  getEditTimeLimit,
  getEditNotAllowedMessage,
  isCreateAllowed
};