package com.swiftvotes.notification.service;

import com.swiftvotes.notification.model.NotificationRecord;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationStore {

    private final CopyOnWriteArrayList<NotificationRecord> notifications = new CopyOnWriteArrayList<>();

    public void record(String voterEmail, UUID voteId, String status) {
        notifications.add(new NotificationRecord(voterEmail, voteId, status, Instant.now()));
    }

    public List<NotificationRecord> findAll() {
        return List.copyOf(notifications);
    }
}
