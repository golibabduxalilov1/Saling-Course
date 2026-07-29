import { useEffect, useId, useRef, useState } from 'react';
import {
  CircleAlert,
  ExternalLink,
  ImageOff,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  VideoOff,
} from 'lucide-react';
import { adminApi } from '../../api/client';
import ConfirmModal from './ConfirmModal';
import { useToast } from '../../context/ToastContext';
import {
  MEDIA_RULES,
  formatFileSize,
  isPlayableVideo,
  isUploadedMedia,
  validateMediaFile,
} from '../../utils/media';

/**
 * Media maydoni: havola (URL) kiritish yoki qurilmadan fayl yuklash.
 * Yuklangan rasm uchun preview, video uchun pleyer ko'rsatiladi; faylni
 * almashtirish va o'chirish ham shu yerda.
 *
 * `kind` — 'image' yoki 'video' (cheklovlar `utils/media.js`da).
 */
export default function MediaField({ kind, id, label, hint, value, onChange }) {
  const rule = MEDIA_RULES[kind];
  const toast = useToast();
  const fileId = `${useId()}-file`;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  // Shu sahifa ochilganda yuklangan fayllar — almashtirilsa, ularni darhol
  // serverdan olib tashlash xavfsiz (mahsulotga hali biriktirilmagan).
  const sessionUploads = useRef(new Set());
  const inputRef = useRef(null);

  useEffect(() => setPreviewFailed(false), [value]);

  const isUploaded = isUploadedMedia(value);

  const clearInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const upload = async (file) => {
    const previous = value;
    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await adminApi.post(rule.endpoint, body, {
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      if (previous && previous !== res.data.url && sessionUploads.current.has(previous)) {
        sessionUploads.current.delete(previous);
        adminApi.delete('/uploads', { data: { url: previous } }).catch(() => {});
      }
      sessionUploads.current.add(res.data.url);

      setMeta(res.data);
      onChange(res.data.url);
      toast.success(`${rule.label} yuklandi`);
    } catch (err) {
      const message = err.response?.data?.error || 'Faylni yuklashda xatolik';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      setProgress(0);
      clearInput();
    }
  };

  const handleFile = (file) => {
    const message = validateMediaFile(kind, file);
    if (message) {
      setError(message);
      toast.error(message);
      clearInput();
      return;
    }
    setError('');
    upload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlChange = (e) => {
    setMeta(null);
    setError('');
    onChange(e.target.value);
  };

  const requestRemove = () => {
    if (isUploaded) {
      setConfirmOpen(true);
      return;
    }
    setMeta(null);
    setError('');
    onChange('');
  };

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await adminApi.delete('/uploads', { data: { url: value } });
      sessionUploads.current.delete(value);
      setMeta(null);
      setError('');
      onChange('');
      toast.success(`${rule.label} o'chirildi. O'zgarishni saqlashni unutmang.`);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Faylni o'chirishda xatolik");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className="relative">
        <Link2
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id={id}
          className="field font-mono text-sm pl-9"
          placeholder="https://"
          value={value || ''}
          onChange={handleUrlChange}
        />
      </div>
      <p className="field-hint">{hint}</p>

      {/* ── Qurilmadan yuklash ─────────────────────────────────────────── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-4 rounded-lg border border-dashed p-5 text-center transition-colors duration-150 ${
          dragging ? 'border-accent bg-accent-tint' : 'border-line-2 bg-sunken'
        }`}
      >
        <Upload size={18} strokeWidth={1.5} className="mx-auto text-ink-3" aria-hidden="true" />
        <p className="mt-3 text-sm text-ink-2">Faylni shu yerga tashlang yoki qurilmangizdan tanlang</p>

        <input
          ref={inputRef}
          id={fileId}
          type="file"
          className="sr-only"
          accept={rule.accept}
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <label
          htmlFor={fileId}
          className={`btn btn-outline btn-sm mt-4 ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="motion-spin" aria-hidden="true" />
              Yuklanmoqda
            </>
          ) : (
            <>
              <Upload size={14} aria-hidden="true" />
              Fayl tanlash
            </>
          )}
        </label>

        <p className="field-hint">
          {rule.formatLabel} · maksimal {rule.maxSizeLabel}
        </p>
      </div>

      {uploading && (
        <div className="mt-3">
          <div className="h-1 w-full rounded-xs bg-veil overflow-hidden" role="presentation">
            <div
              className="h-full bg-accent transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="field-hint figures">{progress}% yuklandi</p>
        </div>
      )}

      {error && (
        <p className="field-error" role="alert">
          <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* ── Preview ────────────────────────────────────────────────────── */}
      {value && (
        <div className="mt-4 border border-line rounded-lg overflow-hidden">
          <div className="aspect-[16/9] bg-veil">
            {kind === 'image' &&
              (previewFailed ? (
                <Placeholder icon={ImageOff} text="Rasmni koʼrsatib boʼlmadi — manzilni tekshiring" />
              ) : (
                <img
                  src={value}
                  alt="Rasm koʼrinishi"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ))}

            {kind === 'video' &&
              (isPlayableVideo(value) && !previewFailed ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={value}
                  controls
                  preload="metadata"
                  className="w-full h-full bg-obsidian"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-ink-3 px-6 text-center">
                  <VideoOff size={26} strokeWidth={1.25} aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
                    {previewFailed ? 'Videoni oʼynatib boʼlmadi' : 'Tashqi video havolasi'}
                  </span>
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="link inline-flex items-center gap-2 text-sm text-ink-2 hover:text-accent"
                  >
                    <ExternalLink size={13} aria-hidden="true" />
                    Havolani ochish
                  </a>
                </div>
              ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm text-ink truncate">
                {meta?.name || (isUploaded ? 'Yuklangan fayl' : 'Tashqi havola')}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-3 truncate figures">
                {meta ? formatFileSize(meta.size) : value}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <label
                htmlFor={fileId}
                className={`btn btn-quiet btn-sm ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
              >
                <RefreshCw size={14} aria-hidden="true" />
                Almashtirish
              </label>
              <button
                type="button"
                onClick={requestRemove}
                className="icon-btn icon-btn-critical"
                aria-label={`${label} — oʼchirish`}
                title="Oʼchirish"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Faylni oʼchirasizmi?"
        description="Yuklangan fayl serverdan butunlay oʼchiriladi. Soʼng mahsulotni saqlashni unutmang."
        loading={removing}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Placeholder({ icon: Icon, text }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-ink-3 px-6 text-center">
      <Icon size={26} strokeWidth={1.25} aria-hidden="true" />
      <span className="font-mono text-[11px] uppercase tracking-[0.12em]">{text}</span>
    </div>
  );
}
