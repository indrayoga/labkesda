import LabkesdaLayout from '@/Layouts/LabkesdaLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'flowbite-react';
import { useState } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import CreateItemPemeriksaanForm from './CreateItemPemeriksaanForm';
import FormReferenceRange from './FormReferenceRange';

// Simple button used for actions per node
function ActionButton({
  title,
  icon: Icon,
  onClick,
  disabled,
  colorClass = 'text-blue-600',
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 px-2 py-1 text-sm font-medium hover:underline disabled:opacity-40 ${colorClass}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{title}</span>
    </button>
  );
}

// Recursive tree node
function TreeNode({
  node,
  level = 0,
  isLast = false,
  onAdd,
  onEdit,
  onDelete,
  onReferenceClick,
}) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const [expanded, setExpanded] = useState(true);

  const indent = level * 20; // px

  return (
    <div className="relative">
      {/* Row with 4 columns: Item, Satuan, Metode, Aksi */}
      <div className="flex items-stretch divide-x divide-slate-200 border-b border-slate-200">
        {/* Item column with indentation and toggle */}
        <div
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2"
          style={{ paddingLeft: indent }}
        >
          {hasChildren ? (
            <button
              type="button"
              className="text-slate-600 hover:text-slate-900"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <FiChevronDown className="h-4 w-4" />
              ) : (
                <FiChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="inline-block w-4" />
          )}

          <span className="truncate font-medium text-slate-800">
            <span className="mr-1 text-slate-400">{isLast ? '└─' : '├─'}</span>
            {node.name}
          </span>
        </div>

        <div className="w-64 shrink-0 self-center px-2 py-2 text-sm text-slate-700">
          {node.reference_ranges &&
            (node.reference_ranges.length > 0 ? (
              <div className="space-y-1">
                {node.reference_ranges.map((range) => (
                  <div
                    key={range.id}
                    className="rounded-md bg-slate-100 px-2 py-1"
                  >
                    {range.label} :{' '}
                    {range.value_type == 'kualitatif'
                      ? `${range.jenis_kelamin} :  ${range.kualitatif_value}`
                      : `${range.jenis_kelamin} : ${range.operator_min} ${range.min_value} - ${range.operator_max}  ${range.max_value}`}
                  </div>
                ))}
              </div>
            ) : null)}
          <ActionButton
            title="[Tambah Nilai Rujukan]"
            icon={FiEdit2}
            onClick={() => onReferenceClick?.(node)}
          />
        </div>

        <div className="w-32 shrink-0 self-center px-2 py-2 text-sm text-slate-700">
          {node.satuan ? (
            node.satuan
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>

        {/* Metode column */}
        <div className="w-56 shrink-0 self-center px-2 py-2 text-sm text-slate-700">
          {node.metode ? (
            node.metode
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>

        {/* Aksi column */}
        <div className="w-48 shrink-0 px-2 py-1">
          <div className="flex items-center gap-1">
            <ActionButton
              title="Tambah Sub Test"
              icon={FiPlus}
              onClick={() => onAdd?.(node)}
              colorClass="text-green-600"
            />
            <ActionButton
              title="Edit"
              icon={FiEdit2}
              onClick={() => onEdit?.(node)}
            />
            <ActionButton
              title="Hapus"
              icon={FiTrash2}
              onClick={() => {
                window.confirm(`Yakin hapus item "${node.name}"?`) &&
                  onDelete?.(node);
              }}
              disabled={!!node.used}
              colorClass="text-red-600"
            />
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.id ?? `${child.name}-${idx}`}
              node={child}
              level={level + 1}
              isLast={idx === node.children.length - 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onReferenceClick={onReferenceClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Index({ kategoriPemeriksaan, itemPemeriksaan, items }) {
  const { props } = usePage();
  const [openModalTambah, setOpenModalTambah] = useState(false);
  const [openModalReferenceRange, setOpenModalReferenceRange] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const itemsData = Array.isArray(items) ? items : [];

  const handleAdd = (node) => {
    setSelectedNode(null);
    setData({
      ...data,
      parent_id: node.id,
      parent_name: node.name,
    });
    setOpenModalTambah(true);
  };

  const handleReferenceClick = (node) => {
    setSelectedNode(node);
    setOpenModalReferenceRange(true);
  };

  const handleEdit = (node) => {
    setSelectedNode(node);
    setData({
      nama: node.name,
      kategori_pemeriksaan_id: node.kategori_pemeriksaan_id,
      satuan: node.satuan || '',
      metode: node.metode || '',
      urut: node.urut || '',
      parent_id: node.parent_id || null,
      parent_name: node.parent_name || '',
    });
    setOpenModalTambah(true);
  };

  const handleDelete = (node) => {
    if (node.used) return;
    router.delete(route('item-pemeriksaan.destroy', node.id), {
      onError: (err) => {
        console.error(err);
      },
    });
  };

  const handleTambah = () => {
    setSelectedNode(null);
    setOpenModalTambah(true);
  };

  const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    reset,
    recentlySuccessful,
  } = useForm({
    nama: '',
    kategori_pemeriksaan_id: '',
    satuan: '',
    metode: '',
    urut: '',
    parent_id: null,
    parent_name: '',
  });

  const submit = (e) => {
    e.preventDefault();
    if (selectedNode?.id) {
      put(route('item-pemeriksaan.update', selectedNode.id), {
        onSuccess: () => {
          reset();
          setOpenModalTambah(false);
          //   resetData();
        },
      });
    } else {
      post(route('item-pemeriksaan.store'), {
        onSuccess: () => {
          reset();
          setOpenModalTambah(false);
          //   resetData();
        },
      });
    }
  };

  return (
    <LabkesdaLayout>
      <Head title="Item Pemeriksaan" />

      <div className="max-w-screen">
        <div className="relative overflow-hidden bg-white shadow-md dark:bg-gray-800">
          <div className="flex flex-col space-y-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
            <div className="flex flex-1 items-center space-x-4">
              <h2>Item Pemeriksaan</h2>
            </div>
            <div className="flex flex-shrink-0 flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 lg:justify-end">
              <button
                type="button"
                onClick={handleTambah}
                className="flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                <svg
                  className="-ml-1 mr-2 h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  ></path>
                </svg>
                Tambah
              </button>
            </div>
          </div>
        </div>
        {/* Table-like wrapper */}
        <div className="relative overflow-hidden border bg-white shadow-md dark:bg-gray-800 sm:rounded-b-lg">
          {/* Header row */}
          <div className="flex items-center divide-x divide-slate-200 border-b border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700">
            <div className="flex-1 px-3 py-2">Item</div>
            <div className="w-64 px-3 py-2">Standar</div>
            <div className="w-32 px-3 py-2">Satuan</div>
            <div className="w-56 px-3 py-2">Metode</div>
            <div className="w-48 px-3 py-2">Aksi</div>
          </div>

          {/* Body rows */}
          <div>
            {items.map((item, idx) => (
              <TreeNode
                key={item.id ?? `${item.name}-${idx}`}
                node={item}
                level={0}
                isLast={idx === items.length - 1}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReferenceClick={handleReferenceClick}
              />
            ))}
          </div>
        </div>
      </div>
      <Modal
        dismissible
        show={openModalTambah}
        size="2xl"
        onClose={() => {
          reset();
          setOpenModalTambah(false);
        }}
      >
        <ModalHeader>Form Item Pemeriksaan</ModalHeader>
        <ModalBody className="max-w-2xl">
          <CreateItemPemeriksaanForm
            kategoriPemeriksaan={kategoriPemeriksaan}
            itemPemeriksaan={itemPemeriksaan}
            data={data}
            setData={setData}
            errors={errors}
            processing={processing}
            recentlySuccessful={recentlySuccessful}
            onClose={() => {
              reset();
              setOpenModalTambah(false);
            }}
            onSubmit={submit}
          />
        </ModalBody>
        <ModalFooter className="flex justify-end">
          <Button
            type="button"
            onClick={() => {
              reset();
              setOpenModalTambah(false);
            }}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25"
          >
            Batal
          </Button>

          <Button
            className={`ml-3 ${processing ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={submit}
            disabled={processing}
          >
            Simpan
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        dismissible
        show={openModalReferenceRange}
        size="6xl"
        onClose={() => {
          setOpenModalReferenceRange(false);
        }}
      >
        <ModalHeader>Input Standar Satuan Nilai Normal</ModalHeader>
        <ModalBody className="max-w-6xl">
          <FormReferenceRange
            item={selectedNode}
            setOpenModalReferenceRange={setOpenModalReferenceRange}
          />
        </ModalBody>
      </Modal>
    </LabkesdaLayout>
  );
}
