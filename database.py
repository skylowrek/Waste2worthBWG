import pymysql
from pymysql.cursors import DictCursor
from config import Config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.config = Config.DB_CONFIG
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = pymysql.connect(**self.config)
            logger.info("✅ Database connected successfully")
            return self.connection
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("🔒 Database connection closed")
    
    def execute_query(self, query, params=None, fetch=False):
        """Execute a single query"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or ())
                
                if fetch:
                    result = cursor.fetchall()
                    return result
                else:
                    self.connection.commit()
                    return cursor.lastrowid
        except Exception as e:
            self.connection.rollback()
            logger.error(f"❌ Query execution failed: {e}")
            raise
    
    def execute_many(self, query, params_list):
        """Execute multiple queries"""
        try:
            with self.connection.cursor() as cursor:
                cursor.executemany(query, params_list)
                self.connection.commit()
                return cursor.rowcount
        except Exception as e:
            self.connection.rollback()
            logger.error(f"❌ Batch execution failed: {e}")
            raise
    
    def fetch_one(self, query, params=None):
        """Fetch single row"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchone()
        except Exception as e:
            logger.error(f"❌ Fetch one failed: {e}")
            raise
    
    def fetch_all(self, query, params=None):
        """Fetch all rows"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"❌ Fetch all failed: {e}")
            raise

# Global database instance
db = Database()
