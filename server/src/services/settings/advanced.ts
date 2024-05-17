import { SuccessResponse } from '../../core/api/ApiResponse';
import AnsibleLogsRepo from '../../data/database/repository/AnsibleLogsRepo';
import LogsRepo from '../../data/database/repository/LogsRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import { restart } from '../../index';

export const postRestartServer = asyncHandler(async (req, res) => {
  await restart();
});

export const deleteLogs = asyncHandler(async (req, res) => {
  await LogsRepo.deleteAll();
  new SuccessResponse('Logs Purged Successfully').send(res);
});

export const deleteAnsibleLogs = asyncHandler(async (req, res) => {
  await AnsibleLogsRepo.deleteAll();
  new SuccessResponse('Ansible logs Purged Successfully').send(res);
});
