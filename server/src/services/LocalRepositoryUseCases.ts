import { Playbooks } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import PlaybooksRepositoryRepo from '../data/database/repository/PlaybooksRepositoryRepo';
import PinoLogger from '../logger';
import { NotFoundError } from '../middlewares/api/ApiError';
import { DIRECTORY_ROOT } from '../modules/playbooks-repository/PlaybooksRepositoryComponent';
import PlaybooksRepositoryEngine from '../modules/playbooks-repository/PlaybooksRepositoryEngine';

const logger = PinoLogger.child(
  { module: 'LocalRepositoryUseCases' },
  { msgPrefix: '[LOCAL_REPOSITORY] - ' },
);

async function addLocalRepository(name: string, directoryExclusionList?: string[]) {
  const uuid = uuidv4();
  const localRepository = await PlaybooksRepositoryEngine.registerRepository({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.LOCAL,
    name,
    enabled: true,
    directory: DIRECTORY_ROOT,
    directoryExclusionList,
  });
  await PlaybooksRepositoryRepo.create({
    uuid,
    type: Playbooks.PlaybooksRepositoryType.LOCAL,
    name,
    directory: localRepository.getDirectory(),
    enabled: true,
    directoryExclusionList,
  });
  try {
    await localRepository.init();
    void localRepository.syncToDatabase();
  } catch (error: any) {
    logger.warn(error);
  }
}

async function updateLocalRepository(
  uuid: string,
  name: string,
  directoryExclusionList?: string[],
) {
  const playbooksRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbooksRepository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryEngine.deregisterRepository(uuid);
  playbooksRepository.name = name;
  playbooksRepository.directoryExclusionList = directoryExclusionList;
  await PlaybooksRepositoryEngine.registerRepository(playbooksRepository);
  await PlaybooksRepositoryRepo.update(playbooksRepository);
}

export default {
  updateLocalRepository,
  addLocalRepository,
};
