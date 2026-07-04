import psycopg

try:
    conn = psycopg.connect(host='localhost', port=5439, dbname='postgres', user='postgres', password='brain', autocommit=True)
    
    # Try to create role
    try:
        conn.execute("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'brain') THEN CREATE ROLE brain LOGIN PASSWORD 'brain'; END IF; END $$;")
        print("Role brain ensured.")
    except Exception as e:
        print("Error creating role:", e)
        
    # Try to create db
    try:
        conn.execute("CREATE DATABASE brain OWNER brain;")
        print("Database brain created.")
    except Exception as e:
        print("Database might already exist:", e)
    
    conn.close()

    # Enable pgvector
    conn2 = psycopg.connect(host='localhost', port=5439, dbname='brain', user='brain', password='brain', autocommit=True)
    try:
        conn2.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("pgvector enabled.")
    except Exception as e:
        print("Error enabling pgvector. Make sure pgvector is installed in your PostgreSQL instance:", e)
    conn2.close()

except Exception as e:
    print("Connection error as postgres user:", e)
    
    print("\nTrying to connect as 'brain' user instead...")
    try:
        conn3 = psycopg.connect(host='localhost', port=5439, dbname='brain', user='brain', password='brain', autocommit=True)
        try:
            conn3.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            print("pgvector enabled successfully.")
        except Exception as e2:
            print("Error enabling pgvector:", e2)
        conn3.close()
    except Exception as e3:
        print("Connection error as brain user:", e3)
