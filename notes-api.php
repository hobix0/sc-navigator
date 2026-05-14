<?php
// ============================================================
// SC Navigator — Notes API
// ============================================================
// Auf deinen Server hochladen (z.B. per FTP/SFTP).
// Dann DB-Zugangsdaten unten eintragen und fertig.
// URL in der App unter Notizen → Server verbinden eintragen.
// ============================================================

// ── Konfiguration ────────────────────────────────────────────
define('DB_HOST', 'http://homeassistant.local:8123/a0d7b954_phpmyadmin');
define('DB_NAME', 'SC_Navigator');   // phpMyAdmin: Datenbankname
define('DB_USER', 'Hobix');        // phpMyAdmin: Benutzername
define('DB_PASS', 'Zwerg199632#');

// Erlaubte Herkunft (CORS). '*' = alle, oder konkrete URL:
// define('CORS_ORIGIN', 'https://hobix0.github.io');
define('CORS_ORIGIN', '*');

// ── CORS-Header ──────────────────────────────────────────────
header('Access-Control-Allow-Origin: '  . CORS_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Datenbankverbindung ──────────────────────────────────────
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB-Verbindung fehlgeschlagen: ' . $e->getMessage()]);
    exit;
}

// Tabelle anlegen falls nicht vorhanden
$pdo->exec("
    CREATE TABLE IF NOT EXISTS `sc_notes` (
        `id`         VARCHAR(20)  NOT NULL,
        `title`      VARCHAR(500) NOT NULL DEFAULT '',
        `content`    LONGTEXT,
        `created_at` BIGINT       NOT NULL DEFAULT 0,
        `updated_at` BIGINT       NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// ── Hilfsfunktionen ──────────────────────────────────────────
function respond($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function body(): array {
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if ($data === null && trim($raw) !== '') {
        respond(['error' => 'Ungültiges JSON'], 400);
    }
    return $data ?: [];
}

// ── Routing ──────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // GET → alle Notizen zurückgeben
    case 'GET':
        $stmt = $pdo->query(
            'SELECT `id`, `title`, `content`, `created_at` AS `created`, `updated_at` AS `updated`
             FROM `sc_notes`
             ORDER BY `updated_at` DESC'
        );
        respond(['notes' => $stmt->fetchAll()]);

    // POST {notes: [...]} → alle Notizen synchronisieren (UPSERT)
    // Die App sendet immer den kompletten aktuellen Stand.
    case 'POST':
        $data  = body();
        $notes = $data['notes'] ?? null;

        if (!is_array($notes)) {
            respond(['error' => '"notes"-Array fehlt im Body'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `sc_notes` (`id`, `title`, `content`, `created_at`, `updated_at`)
            VALUES (:id, :title, :content, :created, :updated)
            ON DUPLICATE KEY UPDATE
                `title`      = VALUES(`title`),
                `content`    = VALUES(`content`),
                `updated_at` = VALUES(`updated_at`)
        ");

        $pdo->beginTransaction();
        try {
            foreach ($notes as $note) {
                $stmt->execute([
                    ':id'      => (string)($note['id']      ?? ''),
                    ':title'   => (string)($note['title']   ?? ''),
                    ':content' => (string)($note['content'] ?? ''),
                    ':created' => (int)   ($note['created'] ?? 0),
                    ':updated' => (int)   ($note['updated'] ?? 0),
                ]);
            }
            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            respond(['error' => 'Speichern fehlgeschlagen: ' . $e->getMessage()], 500);
        }

        respond(['ok' => true, 'synced' => count($notes)]);

    default:
        respond(['error' => 'Methode nicht erlaubt'], 405);
}
