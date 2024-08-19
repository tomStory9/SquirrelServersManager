import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import ServerLogsColumns from '@/pages/Admin/Logs/ServerLogsColums';
import TaskLogsColumns from '@/pages/Admin/Logs/TaskLogsColumns';
import { getServerLogs, getTasksLogs } from '@/services/rest/logs';
import { UnorderedListOutlined } from '@ant-design/icons';
import {
  ColumnsState,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { useSearchParams } from '@umijs/max';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';

const Index: React.FC = () => {
  const [form] = ProForm.useForm<any>();
  const [searchParams] = useSearchParams();

  const [columnsStateMap, setColumnsStateMap] = useState<
    Record<string, ColumnsState>
  >({
    req: {
      show: false,
    },
    res: {
      show: false,
    },
  });
  if (searchParams.get('module')) {
    form.setFieldsValue({ module: searchParams.get('module') });
  }
  if (searchParams.get('moduleId')) {
    form.setFieldsValue({ moduleId: searchParams.get('moduleId') });
  }
  const logsTabItem = [
    {
      key: '1',
      label: <div>Server Logs</div>,
      children: (
        <ProTable<API.ServerLog>
          rowKey="_id"
          request={getServerLogs}
          columns={ServerLogsColumns}
          search={{
            labelWidth: 120,
            form: form,
            filterType: 'light',
          }}
          dateFormatter="string"
          columnsState={{
            value: columnsStateMap,
            onChange: setColumnsStateMap,
          }}
        />
      ),
    },
    {
      key: '2',
      label: <div>Task Logs</div>,
      children: (
        <ProTable<API.Task>
          rowKey="ident"
          request={getTasksLogs}
          columns={TaskLogsColumns}
          search={{
            labelWidth: 120,
            filterType: 'light',
          }}
          dateFormatter="string"
        />
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Logs'}
            backgroundColor={PageContainerTitleColors.LOGS}
            icon={<UnorderedListOutlined />}
          />
        ),
      }}
      tabList={logsTabItem}
    />
  );
};

export default Index;
