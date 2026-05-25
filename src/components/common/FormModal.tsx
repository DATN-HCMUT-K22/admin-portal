'use client'

import { Modal, Form, Button, Space, App } from 'antd'
import type { FormInstance } from 'antd'
import { ReactNode, useEffect } from 'react'

interface FormModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: (values: any) => Promise<void>
  title: string
  form: FormInstance
  children: ReactNode
  width?: number
  editMode?: boolean
  initialValues?: any
}

export function FormModal({
  open,
  onCancel,
  onSubmit,
  title,
  form,
  children,
  width = 600,
  editMode = false,
  initialValues,
}: FormModalProps) {
  const { message } = App.useApp()

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues)
    } else if (!open) {
      form.resetFields()
    }
  }, [open, form, initialValues])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await onSubmit(values)
      message.success(`${editMode ? 'Updated' : 'Created'} successfully`)
      form.resetFields()
      onCancel()
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error - handled by Form.Item
        return
      }
      // API error
      message.error(error.message || 'Operation failed')
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={title}
      width={width}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {children}

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
