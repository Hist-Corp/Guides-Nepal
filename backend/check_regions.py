from app.core.database import SessionLocal
from app.models.user import User
db = SessionLocal()
users = db.query(User).filter(User.role=='regional-head').all()
for u in users:
    print(f'{u.email} | region: "{u.region}"')
db.close()