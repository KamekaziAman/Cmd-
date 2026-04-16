from rest_framework import serializers

from .models import Command, Label


class CommandSerializer(serializers.ModelSerializer):
    labels = serializers.SerializerMethodField()
    label_names = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Command
        fields = [
            "id",
            "created_by",
            "created_by_username",
            "title",
            "description",
            "command",
            "labels",
            "label_names",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_by_username",
            "labels",
            "created_at",
        ]

    def get_labels(self, obj):
        return [label.name for label in obj.labels.all()]

    def _set_labels(self, command, label_names):
        names = [name.strip() for name in label_names.split(",") if name.strip()]
        labels = []

        for name in names:
            label, _ = Label.objects.get_or_create(name=name)
            labels.append(label)

        command.labels.set(labels)

    def create(self, validated_data):
        label_names = validated_data.pop("label_names", "")
        command = Command.objects.create(**validated_data)
        self._set_labels(command, label_names)
        return command

    def update(self, instance, validated_data):
        label_names = validated_data.pop("label_names", None)
        instance = super().update(instance, validated_data)

        if label_names is not None:
            self._set_labels(instance, label_names)

        return instance
