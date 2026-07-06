import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import { securityApi } from '../../api/endpoints';

export default function EmergencyContactsModal({ open, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    securityApi
      .emergencyContacts()
      .then((res) => setContacts(res.data))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Emergency Contacts" maxWidth="max-w-md">
      {loading ? (
        <Spinner full />
      ) : (
        <div className="space-y-3">
          {contacts.map((c, i) => (
            <a
              key={i}
              href={`tel:${c.phone}`}
              className="flex items-center justify-between p-4 rounded-xl border border-outline-variant hover:border-error/40 hover:bg-error-container/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined">emergency</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{c.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{c.type}</p>
                </div>
              </div>
              <span className="font-title-lg text-title-lg text-error font-bold">{c.phone}</span>
            </a>
          ))}
        </div>
      )}
    </Modal>
  );
}
