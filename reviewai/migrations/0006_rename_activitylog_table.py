from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('reviewai', '0005_activitylog'),
    ]

    operations = [
        migrations.RunSQL(
            "RENAME TABLE reviewai_activitylog TO activity_log;",
            "RENAME TABLE activity_log TO reviewai_activitylog;"
        ),
    ]