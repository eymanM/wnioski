import {IconSettings} from '@tabler/icons-react';
import {useContext, useState} from 'react';

import {useTranslation} from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';

import {SettingDialog} from '@/components/Settings/SettingDialog';
import {SidebarButton} from '../../Sidebar/SidebarButton';


export const ChatbarSettings = () => {
  const {t} = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);

  const {
    state: {
      lightMode,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18}/>}
        onClick={() => setIsSettingDialog(true)}
      />

      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}
      />
    </div>
  );
};
