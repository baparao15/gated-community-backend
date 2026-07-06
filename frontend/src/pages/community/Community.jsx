import { useEffect, useState } from 'react';
import { announcementApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '../../components/ui/FormField';
import { formatDateTime, timeAgo, initials } from '../../utils/format';

export default function Community() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = ['Admin', 'SuperAdmin'].includes(user?.role);
  const canAlert = ['Admin', 'SuperAdmin', 'Guard'].includes(user?.role);

  const [tab, setTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [annOpen, setAnnOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', body: '', type: 'notice', audience: 'all' });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ title: '', message: '' });
  const [postOpen, setPostOpen] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', body: '', category: 'general' });
  const [commentDrafts, setCommentDrafts] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([announcementApi.list({ limit: 20 }), announcementApi.listPosts({ limit: 20 })])
      .then(([ann, p]) => {
        setAnnouncements(ann.data);
        setPosts(p.data.map((post) => ({ ...post, localComments: [] })));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementApi.create(annForm);
      toast.success('Announcement posted');
      setAnnOpen(false);
      setAnnForm({ title: '', body: '', type: 'notice', audience: 'all' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    await announcementApi.remove(id);
    toast.success('Announcement removed');
    load();
  };

  const triggerAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementApi.triggerEmergency(alertForm);
      toast.success('Emergency alert broadcast to all residents');
      setAlertOpen(false);
      setAlertForm({ title: '', message: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not broadcast alert');
    } finally {
      setSubmitting(false);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await announcementApi.createPost(postForm);
      toast.success('Post published');
      setPostOpen(false);
      setPostForm({ title: '', body: '', category: 'general' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not publish post');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (postId) => {
    const res = await announcementApi.likePost(postId);
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, likesCount: res.data.likes } : p)));
  };

  const submitComment = async (postId) => {
    const body = commentDrafts[postId];
    if (!body?.trim()) return;
    const res = await announcementApi.addComment(postId, body);
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, localComments: [...p.localComments, res.data] } : p))
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="eyebrow">Community bulletin</p>
          <h2 className="page-title mt-2">Notices and conversations in one courtyard.</h2>
          <p className="mt-2 max-w-2xl text-on-surface-variant font-body-md">Stay informed, share updates, and keep the community record easy to scan on mobile.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 bg-surface-container-low p-1 rounded-full">
            {[
              { key: 'announcements', label: 'Announcements' },
              { key: 'forum', label: 'Forum' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors ${
                  tab === t.key ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'announcements' && canAlert && (
            <Button variant="danger" icon="emergency" onClick={() => setAlertOpen(true)}>
              Emergency Alert
            </Button>
          )}
          {tab === 'announcements' && isAdmin && (
            <Button icon="add" onClick={() => setAnnOpen(true)}>New Announcement</Button>
          )}
          {tab === 'forum' && user?.role === 'Resident' && (
            <Button icon="add" onClick={() => setPostOpen(true)}>New Post</Button>
          )}
        </div>
      </div>

      {loading ? (
        <Spinner full />
      ) : tab === 'announcements' ? (
        announcements.length === 0 ? (
          <Card className="p-lg"><EmptyState icon="campaign" title="No announcements yet" /></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {announcements.map((a) => (
              <Card key={a._id} className={`p-6 ${a.type === 'emergency' ? 'border-error/40 bg-error-container/10' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <Badge tone={a.type === 'emergency' ? 'error' : 'primary'}>{a.type}</Badge>
                  <div className="flex items-center gap-2">
                    {a.isPinned && <Badge tone="primary">Pinned</Badge>}
                    {isAdmin && (
                      <button onClick={() => deleteAnnouncement(a._id)} className="text-on-surface-variant hover:text-error transition-colors duration-200" aria-label={`Delete announcement: ${a.title}`}>
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="font-title-lg text-title-lg text-on-surface mb-1">{a.title}</h4>
                <p className="text-body-sm text-on-surface-variant mb-3">{a.body}</p>
                <p className="text-label-sm text-outline">
                  {a.postedBy?.name} • {timeAgo(a.createdAt)}
                </p>
              </Card>
            ))}
          </div>
        )
      ) : posts.length === 0 ? (
        <Card className="p-lg"><EmptyState icon="forum" title="No posts yet" description="Start a conversation with your neighbors." /></Card>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {posts.map((p) => (
            <Card key={p._id} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold shrink-0">
                  {initials(p.author?.name)}
                </div>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{p.author?.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{timeAgo(p.createdAt)} • <span className="capitalize">{p.category}</span></p>
                </div>
              </div>
              <h4 className="font-title-lg text-title-lg text-on-surface mb-1">{p.title}</h4>
              <p className="text-body-sm text-on-surface-variant mb-4">{p.body}</p>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => toggleLike(p._id)} className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                  <span className="text-label-sm">{p.likesCount ?? p.likes?.length ?? 0}</span>
                </button>
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  <span className="text-label-sm">{p.localComments.length}</span>
                </div>
              </div>
              {p.localComments.length > 0 && (
                <div className="space-y-2 mb-3 pl-4 border-l-2 border-outline-variant">
                  {p.localComments.map((c, i) => (
                    <div key={i} className="text-body-sm">
                      <span className="font-bold text-on-surface">{c.author?.name || 'You'}: </span>
                      <span className="text-on-surface-variant">{c.body}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment…"
                  value={commentDrafts[p._id] || ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [p._id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment(p._id)}
                />
                <Button size="sm" variant="outline" onClick={() => submitComment(p._id)}>Post</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={annOpen} onClose={() => setAnnOpen(false)} title="New Announcement">
        <form id="ann-form" onSubmit={createAnnouncement} className="grid grid-cols-2 gap-md">
          <Field label="Title" className="col-span-2"><Input required value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} /></Field>
          <Field label="Type" className="col-span-1">
            <Select value={annForm.type} onChange={(e) => setAnnForm({ ...annForm, type: e.target.value })}>
              <option value="notice">Notice</option>
              <option value="event">Event</option>
              <option value="emergency">Emergency</option>
            </Select>
          </Field>
          <Field label="Audience" className="col-span-1">
            <Select value={annForm.audience} onChange={(e) => setAnnForm({ ...annForm, audience: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="residents">Residents</option>
              <option value="staff">Staff</option>
              <option value="guards">Guards</option>
            </Select>
          </Field>
          <Field label="Message" className="col-span-2"><Textarea required value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} /></Field>
        </form>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setAnnOpen(false)}>Cancel</Button>
          <Button type="submit" form="ann-form" loading={submitting}>Publish</Button>
        </div>
      </Modal>

      <Modal open={alertOpen} onClose={() => setAlertOpen(false)} title="Broadcast Emergency Alert" maxWidth="max-w-sm">
        <form id="alert-form" onSubmit={triggerAlert} className="space-y-4">
          <Field label="Title"><Input required value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} /></Field>
          <Field label="Message"><Textarea required value={alertForm.message} onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })} /></Field>
        </form>
        <Button type="submit" form="alert-form" variant="danger" className="w-full mt-6" loading={submitting}>
          Broadcast Now
        </Button>
      </Modal>

      <Modal open={postOpen} onClose={() => setPostOpen(false)} title="New Forum Post">
        <form id="post-form" onSubmit={createPost} className="grid grid-cols-2 gap-md">
          <Field label="Title" className="col-span-2"><Input required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} /></Field>
          <Field label="Category" className="col-span-2">
            <Select value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}>
              {['general', 'buy-sell', 'help', 'events', 'feedback', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Message" className="col-span-2"><Textarea required value={postForm.body} onChange={(e) => setPostForm({ ...postForm, body: e.target.value })} /></Field>
        </form>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setPostOpen(false)}>Cancel</Button>
          <Button type="submit" form="post-form" loading={submitting}>Publish</Button>
        </div>
      </Modal>
    </div>
  );
}
