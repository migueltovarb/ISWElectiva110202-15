# Generated by Django 5.2.1 on 2025-05-31 16:10

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Tarea',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('estado', models.CharField(choices=[('pendiente', 'Pendiente'), ('en_progreso', 'En progreso'), ('completada', 'Completada')], default='pendiente', max_length=20)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-fecha_creacion'],
            },
        ),
    ]
