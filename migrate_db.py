import sqlite3

def migrate():
    conn = sqlite3.connect('instance/database.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE task ADD COLUMN description TEXT")
        print("Migration successful: added description to task table.")
    except sqlite3.OperationalError as e:
        print("Migration error:", e)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate()
