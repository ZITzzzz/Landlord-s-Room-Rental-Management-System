import { Form, Input, Modal, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useHuyDatCoc } from '../hooks/useDatCoc';
import { getDatCocByPhong } from '../api/datCoc.api';

/**
 * Props:
 *   open       - boolean
 *   phong_id   - string  (used to look up the active DatCoc)
 *   onSuccess  - called after successful cancellation
 *   onCancel   - called on cancel/close
 */
export default function HuyDatCocModal({ open, phong_id, onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const huyMutation = useHuyDatCoc();

  const { data: datCoc, isLoading } = useQuery({
    queryKey: ['datCocActive', phong_id],
    queryFn: () => getDatCocByPhong(phong_id),
    enabled: open && !!phong_id,
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    await huyMutation.mutateAsync({ id: datCoc._id, data: values });
    form.resetFields();
    onSuccess();
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Hủy đặt cọc"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Xác nhận hủy"
      cancelText="Đóng"
      okButtonProps={{ danger: true, loading: huyMutation.isPending, disabled: isLoading || !datCoc }}
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : (
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="ly_do_huy"
            label="Lý do hủy"
            rules={[{ required: true, message: 'Vui lòng nhập lý do hủy' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do hủy đặt cọc..." />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
