import * as React from "react";
import { CalendarApp } from "./components/CalendarApp";

interface CalendarioAnualProps {
  datasource: any[];
  globalabsences: any[];
  admin: boolean;
  userid: string;
  darkMode: boolean;
  absencePanel: boolean;
  debugRawData?: any[];
  debugColumnNames?: string[];
  debugColumnInfo?: any[];
  debugMappedData?: any[];
  debugGlobalRaw?: any[];
  debugGlobalColumnInfo?: any[];
  debugMappedGlobal?: any[];
  onRecordsChange: (newRecords: any[], deletedRecords: any[]) => void;
}

const DebugSection: React.FC<{
  title: string;
  darkMode: boolean;
  children: React.ReactNode;
}> = ({ title, darkMode, children }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ margin: "12px 0 6px" }}>{title}</h3>
    <div
      style={{
        backgroundColor: darkMode ? "#2d2d2d" : "#f5f5f5",
        padding: 12,
        borderRadius: 6,
        overflowX: "auto"
      }}
    >
      {children}
    </div>
  </div>
);

const ColumnTable: React.FC<{ columns: any[] }> = ({ columns }) => (
  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
    <thead>
      <tr style={{ borderBottom: "2px solid #888" }}>
        <th style={{ textAlign: "left", padding: "4px 8px" }}>name</th>
        <th style={{ textAlign: "left", padding: "4px 8px" }}>displayName</th>
        <th style={{ textAlign: "left", padding: "4px 8px" }}>dataType</th>
      </tr>
    </thead>
    <tbody>
      {columns.map((col: any, i: number) => (
        <tr key={i} style={{ borderBottom: "1px solid #555" }}>
          <td style={{ padding: "4px 8px" }}>{col.name}</td>
          <td style={{ padding: "4px 8px" }}>{col.displayName}</td>
          <td style={{ padding: "4px 8px" }}>{col.dataType}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const JsonBlock: React.FC<{ data: any[]; max?: number; darkMode: boolean }> = ({
  data,
  max = 3,
  darkMode
}) => (
  <pre
    style={{
      backgroundColor: darkMode ? "#2d2d2d" : "#f5f5f5",
      padding: 12,
      borderRadius: 6,
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      maxHeight: "40vh",
      overflowY: "auto",
      margin: 0
    }}
  >
    {data.length > 0
      ? JSON.stringify(data.slice(0, max), null, 2)
      : "No hay registros"}
  </pre>
);

export const CalendarioAnual: React.FC<CalendarioAnualProps> = ({
  datasource,
  globalabsences,
  admin,
  userid,
  darkMode,
  absencePanel,
  debugRawData,
  debugColumnInfo,
  debugMappedData,
  debugGlobalRaw,
  debugGlobalColumnInfo,
  debugMappedGlobal,
  onRecordsChange
}) => {
  const [showDebug, setShowDebug] = React.useState(false);
  const [debugTab, setDebugTab] = React.useState<"main" | "global">("main");

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Botón flotante de debug */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 99999,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          backgroundColor: showDebug ? "#d32f2f" : "#1976d2",
          color: "#fff",
          fontSize: 20,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
        }}
        title="Toggle Dataset Debug"
      >
        🐛
      </button>

      {/* Panel de debug */}
      {showDebug && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "50vw",
            height: "100vh",
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            color: darkMode ? "#d4d4d4" : "#1e1e1e",
            zIndex: 99998,
            overflowY: "auto",
            padding: 20,
            boxShadow: "-4px 0 16px rgba(0,0,0,0.3)",
            fontFamily: "Consolas, monospace",
            fontSize: 13
          }}
        >
          <h2 style={{ marginTop: 0 }}>🔍 Dataset Debug</h2>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["main", "global"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setDebugTab(tab)}
                style={{
                  padding: "6px 16px",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  backgroundColor:
                    debugTab === tab
                      ? "#1976d2"
                      : darkMode
                        ? "#333"
                        : "#e0e0e0",
                  color: debugTab === tab ? "#fff" : darkMode ? "#ccc" : "#333",
                  fontFamily: "inherit",
                  fontSize: 13
                }}
              >
                {tab === "main" ? "📋 SPCalendar" : "🌐 SPFestivo"}
              </button>
            ))}
          </div>

          {debugTab === "main" && (
            <>
              <DebugSection
                title={`Columnas SPCalendar (${debugColumnInfo?.length || 0})`}
                darkMode={darkMode}
              >
                {debugColumnInfo && debugColumnInfo.length > 0 ? (
                  <ColumnTable columns={debugColumnInfo} />
                ) : (
                  <em>No se detectaron columnas</em>
                )}
              </DebugSection>

              <DebugSection
                title={`Registros crudos (3 de ${debugRawData?.length || 0})`}
                darkMode={darkMode}
              >
                <JsonBlock
                  data={debugRawData || []}
                  max={3}
                  darkMode={darkMode}
                />
              </DebugSection>

              <DebugSection
                title={`Registros mapeados (3 de ${debugMappedData?.length || 0})`}
                darkMode={darkMode}
              >
                <JsonBlock
                  data={debugMappedData || []}
                  max={3}
                  darkMode={darkMode}
                />
              </DebugSection>
            </>
          )}

          {debugTab === "global" && (
            <>
              <DebugSection
                title={`Columnas SPFestivo (${debugGlobalColumnInfo?.length || 0})`}
                darkMode={darkMode}
              >
                {debugGlobalColumnInfo && debugGlobalColumnInfo.length > 0 ? (
                  <ColumnTable columns={debugGlobalColumnInfo} />
                ) : (
                  <em>No se detectaron columnas</em>
                )}
              </DebugSection>

              <DebugSection
                title={`Registros crudos (3 de ${debugGlobalRaw?.length || 0})`}
                darkMode={darkMode}
              >
                <JsonBlock
                  data={debugGlobalRaw || []}
                  max={3}
                  darkMode={darkMode}
                />
              </DebugSection>

              <DebugSection
                title={`Registros mapeados (3 de ${debugMappedGlobal?.length || 0})`}
                darkMode={darkMode}
              >
                <JsonBlock
                  data={debugMappedGlobal || []}
                  max={3}
                  darkMode={darkMode}
                />
              </DebugSection>
            </>
          )}
        </div>
      )}

      {/* Calendario real */}
      <CalendarApp
        datasource={datasource}
        globalabsences={globalabsences}
        admin={admin}
        userid={userid}
        darkMode={darkMode}
        absencePanel={absencePanel}
        onSave={(updatedEvents: any[]) => {
          onRecordsChange(updatedEvents, []);
        }}
        onDelete={(deletedRecords: any[]) => {
          onRecordsChange([], deletedRecords);
        }}
      />
    </div>
  );
};
