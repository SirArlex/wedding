import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { gallery as galleryApi } from '../api.js';
import { Upload, Trash2, GripVertical, Pencil, Check, X } from 'lucide-react';

function ImageCard({ image, onDelete, onUpdateCaption, dragHandleProps }) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(image.caption || '');
  const [saving, setSaving] = useState(false);

  async function saveCaption() {
    setSaving(true);
    try {
      await onUpdateCaption(image._id, caption);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setCaption(image.caption || '');
    setEditing(false);
  }

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute left-2 top-2 z-10 cursor-grab rounded-md bg-black/40 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Drag to reorder"
      >
        <GripVertical size={14} className="text-white" />
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(image._id)}
        className="absolute right-2 top-2 z-10 rounded-md bg-black/40 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
        title="Delete image"
      >
        <Trash2 size={14} className="text-white" />
      </button>

      {/* Image */}
      <div className="aspect-square bg-gray-100">
        <img
          src={image.thumbnailUrl || image.url}
          alt={image.alt || image.caption || 'Gallery image'}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <div className="p-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:border-rose-400 focus:outline-none"
              placeholder="Add a caption…"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') saveCaption(); if (e.key === 'Escape') cancelEdit(); }}
            />
            <button onClick={saveCaption} disabled={saving} className="text-green-600 hover:text-green-700 disabled:opacity-50">
              <Check size={14} />
            </button>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 truncate text-xs text-gray-500">
              {image.caption || <span className="text-gray-300 italic">No caption</span>}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              title="Edit caption"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Gallery() {
  const { weddingId } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [reordering, setReordering] = useState(false);
  const fileInputRef = useRef(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const load = useCallback(() => {
    if (!weddingId) return;
    setLoading(true);
    galleryApi
      .list(weddingId)
      .then((res) => setImages(res.data.images || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [weddingId]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const res = await galleryApi.upload(weddingId, files[i]);
        setImages((prev) => [...prev, res.data.image]);
      } catch (err) {
        setError(`Failed to upload ${files[i].name}: ${err.message}`);
      }
    }
    setUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDelete(imageId) {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      await galleryApi.delete(weddingId, imageId);
      setImages((prev) => prev.filter((img) => img._id !== imageId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateCaption(imageId, caption) {
    await galleryApi.update(weddingId, imageId, { caption });
    setImages((prev) =>
      prev.map((img) => (img._id === imageId ? { ...img, caption } : img))
    );
  }

  // Drag-and-drop reorder
  function handleDragStart(index) {
    dragItem.current = index;
  }

  function handleDragEnter(index) {
    dragOverItem.current = index;
    if (dragItem.current === null || dragItem.current === index) return;
    const updated = [...images];
    const dragged = updated.splice(dragItem.current, 1)[0];
    updated.splice(index, 0, dragged);
    dragItem.current = index;
    setImages(updated);
  }

  async function handleDragEnd() {
    dragItem.current = null;
    dragOverItem.current = null;
    // Save new order
    setReordering(true);
    try {
      const ordered = images.map((img, i) => ({ id: img._id, order: i }));
      await galleryApi.reorder(weddingId, ordered);
    } catch (err) {
      setError('Failed to save order: ' + err.message);
      load(); // reload to restore correct order
    } finally {
      setReordering(false);
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500">
            {images.length} image{images.length !== 1 ? 's' : ''} · Drag to reorder
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
          >
            <Upload size={15} />
            {uploading ? uploadProgress : 'Upload Images'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {reordering && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600">
          Saving new order…
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
          <Upload size={32} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No images yet</p>
          <p className="mt-1 text-xs text-gray-400">Click "Upload Images" to add photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image._id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <ImageCard
                image={image}
                onDelete={handleDelete}
                onUpdateCaption={handleUpdateCaption}
                dragHandleProps={{
                  onMouseDown: (e) => e.stopPropagation(),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
