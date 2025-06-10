import { useState, useEffect } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { notifications } from '@mantine/notifications';
import { useTimeCalculations } from "./useTimeCalculations";

export function useArbeitszeiten(selectedMitarbeiter) {
  const token = localStorage.getItem("token");
  const [arbeitszeiten, setArbeitszeiten] = useState([]);
  const [selectedMonat, setSelectedMonat] = useState(dayjs());
  const [heutigerEintrag, setHeutigerEintrag] = useState(null);
  const [monatlicheStatistik, setMonatlicheStatistik] = useState({
    gesamtStunden: 0,
    arbeitsTage: 0,
    durchschnittProTag: 0,
  });

  const { calculateWorkingHoursAndPause, formatHoursAndMinutes } = useTimeCalculations();

  const berechneMontlicheStatistik = () => {
    let gesamtStunden = 0;
    let arbeitsTage = 0;

    if (!arbeitszeiten || !Array.isArray(arbeitszeiten) || arbeitszeiten.length === 0) {
      setMonatlicheStatistik({
        gesamtStunden: "-",
        arbeitsTage: 0,
        durchschnittProTag: "-"
      });
      return;
    }

    const abgeschlosseneZeiten = arbeitszeiten.filter(a => a.endzeit);

    abgeschlosseneZeiten.forEach(zeit => {
      const { workingHours } = calculateWorkingHoursAndPause(zeit.anfangszeit, zeit.endzeit);
      
      if (workingHours > 0) {
        gesamtStunden += workingHours;
        arbeitsTage++;
      }
    });

    const durchschnittProTag = arbeitsTage > 0 ? gesamtStunden / arbeitsTage : 0;

    setMonatlicheStatistik({
      gesamtStunden: gesamtStunden > 0 ? formatHoursAndMinutes(gesamtStunden) : "-",
      arbeitsTage,
      durchschnittProTag: durchschnittProTag > 0 ? formatHoursAndMinutes(durchschnittProTag) : "-"
    });
  };

  useEffect(() => {
    berechneMontlicheStatistik();
  }, [arbeitszeiten]);

  const refreshArbeitszeiten = async () => {
    if (!selectedMitarbeiter || !selectedMonat) return;
    
    const monthString = selectedMonat.format("YYYY-MM");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/arbeitszeiten/${selectedMitarbeiter.ID}?monat=${monthString}`,
        { headers: { Authorization: token } }
      );
      
      const uniqueEntries = {};
      response.data.forEach(item => {
        const datumKey = dayjs(item.datum).format("YYYY-MM-DD");
        
        if (uniqueEntries[datumKey]) {
          if (item.endzeit && !uniqueEntries[datumKey].endzeit) {
            uniqueEntries[datumKey] = item;
          } 
          else if ((item.endzeit && uniqueEntries[datumKey].endzeit) || 
                  (!item.endzeit && !uniqueEntries[datumKey].endzeit)) {
            if (item.id > uniqueEntries[datumKey].id) {
              uniqueEntries[datumKey] = item;
            }
          }
        } else {
          uniqueEntries[datumKey] = item;
        }
      });
      
      const uniqueArbeitszeiten = Object.values(uniqueEntries);
      setArbeitszeiten(uniqueArbeitszeiten);
      
      const heuteDatumKey = dayjs().format("YYYY-MM-DD");
      const heutiger = uniqueEntries[heuteDatumKey] || null;
      setHeutigerEintrag(heutiger);
      
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Arbeitszeiten:", error);
      setArbeitszeiten([]);
      notifications.show({
        title: 'Fehler',
        message: 'Arbeitszeiten konnten nicht aktualisiert werden.',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    refreshArbeitszeiten();
  }, [selectedMitarbeiter, selectedMonat]);

  return {
    arbeitszeiten,
    setArbeitszeiten,
    selectedMonat,
    setSelectedMonat,
    heutigerEintrag,
    setHeutigerEintrag,
    monatlicheStatistik,
    refreshArbeitszeiten
  };
}
export default useArbeitszeiten;