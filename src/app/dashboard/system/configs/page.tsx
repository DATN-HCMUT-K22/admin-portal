"use client";

import React, { useMemo, useState } from "react";
import { Tabs, Card, Switch, InputNumber, Input, Spin, notification, Typography, Space, Divider } from "antd";
import { useConfigs, useUpdateConfig } from "@/hooks/use-system-configs";
import type { SystemConfigResponse } from "@/types/api";
import { InfoCircleOutlined, SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function SystemConfigsPage() {
  const { data: configs, isLoading, error } = useConfigs();
  const { mutate: updateConfig, isPending } = useUpdateConfig();

  // Group configs by 'group' field
  const groupedConfigs = useMemo(() => {
    if (!configs) return {};
    return configs.reduce((acc, config) => {
      const groupName = config.group || "General";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(config);
      return acc;
    }, {} as Record<string, SystemConfigResponse[]>);
  }, [configs]);

  const handleUpdate = (key: string, value: string) => {
    updateConfig(
      { key, body: { value } },
      {
        onSuccess: () => {
          notification.success({
            message: "Thành công",
            description: `Cập nhật cấu hình [${key}] thành công.`,
            placement: "bottomRight",
          });
        },
        onError: (err) => {
          notification.error({
            message: "Thất bại",
            description: `Lỗi khi cập nhật cấu hình [${key}]. Vui lòng thử lại.`,
            placement: "bottomRight",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !configs) {
    return (
      <div className="p-6">
        <Card>
          <Text type="danger">Có lỗi xảy ra khi tải cấu hình hệ thống.</Text>
        </Card>
      </div>
    );
  }

  const items = Object.entries(groupedConfigs).map(([groupName, groupConfigs]) => ({
    key: groupName,
    label: (
      <span className="capitalize font-medium">
        <SettingOutlined className="mr-2" />
        {groupName.toLowerCase().replace(/_/g, " ")}
      </span>
    ),
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mt-4">
        {groupConfigs.map((config) => (
          <ConfigItemCard
            key={config.key}
            config={config}
            onUpdate={handleUpdate}
            isUpdating={isPending}
          />
        ))}
      </div>
    ),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col mb-4">
        <Title level={3}>System Configurations</Title>
        <Text type="secondary">
          Quản lý các tham số cấu hình động của hệ thống. Thay đổi sẽ có hiệu lực ngay lập tức.
        </Text>
      </div>

      <Card className="shadow-sm rounded-lg" styles={{ body: { padding: '24px' }}}>
        <Tabs defaultActiveKey={items[0]?.key} items={items} tabPosition="left" />
      </Card>
    </div>
  );
}

function ConfigItemCard({
  config,
  onUpdate,
  isUpdating,
}: {
  config: SystemConfigResponse;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}) {
  const [localValue, setLocalValue] = useState(config.value);

  const handleBlurOrPressEnter = () => {
    if (localValue !== config.value) {
      onUpdate(config.key, localValue.toString());
    }
  };

  const renderInput = () => {
    switch (config.data_type.toUpperCase()) {
      case "BOOLEAN":
        return (
          <Switch
            checked={config.value === "true"}
            onChange={(checked) => onUpdate(config.key, checked.toString())}
            disabled={isUpdating}
          />
        );
      case "INTEGER":
      case "NUMBER":
        return (
          <InputNumber
            value={Number(localValue)}
            onChange={(val) => setLocalValue(val?.toString() || "")}
            onBlur={handleBlurOrPressEnter}
            onPressEnter={handleBlurOrPressEnter}
            disabled={isUpdating}
            className="w-full max-w-[200px]"
          />
        );
      case "STRING":
      default:
        // Use TextArea if value is long, else Input
        return localValue.length > 50 ? (
          <TextArea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlurOrPressEnter}
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={isUpdating}
          />
        ) : (
          <Input
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlurOrPressEnter}
            onPressEnter={handleBlurOrPressEnter}
            disabled={isUpdating}
            className="w-full"
          />
        );
    }
  };

  return (
    <Card
      size="small"
      className="border border-gray-200 hover:border-blue-400 transition-colors shadow-sm rounded-md"
    >
      <div className="flex flex-col justify-between h-full space-y-4">
        <div>
          <div className="flex justify-between items-start mb-2">
            <Text strong className="text-base truncate mr-2" title={config.key}>
              {config.key}
            </Text>
            <div className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 whitespace-nowrap">
              {config.data_type}
            </div>
          </div>
          
          <div className="flex items-start text-gray-500 text-sm mb-4 min-h-[40px]">
            <InfoCircleOutlined className="mt-1 mr-2 flex-shrink-0" />
            <Text type="secondary" className="text-sm">
              {config.description || "Không có mô tả cho cấu hình này."}
            </Text>
          </div>
        </div>

        <div>
          <Divider style={{ margin: "12px 0" }} />
          <div className="flex justify-between items-center mt-2">
            <Text type="secondary" className="text-xs">
              Last updated: {config.updated_at ? new Date(config.updated_at).toLocaleDateString() : 'N/A'}
            </Text>
            <div className="flex items-center justify-end">
              {renderInput()}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
