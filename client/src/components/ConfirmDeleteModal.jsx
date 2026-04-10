import { Modal } from 'antd';

export default function ConfirmDeleteModal({ open, onConfirm, onCancel, loading, itemName }) {
  return (
    <Modal
      title="Xác nhận xóa"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true, loading }}
    >
      Bạn có chắc muốn xóa <strong>{itemName}</strong> không? Hành động này không thể hoàn tác.
    </Modal>
  );
}
