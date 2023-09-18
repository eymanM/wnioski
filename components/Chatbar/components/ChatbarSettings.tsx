import {IconSettings} from '@tabler/icons-react';
import {useContext, useState} from 'react';


import {SettingDialog} from '@/components/Settings/SettingDialog';
import {SidebarButton} from '../../Sidebar/SidebarButton';
import HomeContext from "@/pages/api/home/home.context";
import {Key} from "@/components/Settings/Key";
import ChatbarContext from "@/components/Chatbar/Chatbar.context";


export const ChatbarSettings = () => {
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const {
    state: {
      apiKey,
      serverSideApiKeyIsSet,
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const {
    handleApiKeyChange,
  } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      <SidebarButton
        text={'Settings'}
        icon={<IconSettings size={18}/>}
        onClick={() => setIsSettingDialog(true)}
      />

      {!serverSideApiKeyIsSet ? (
        <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange}/>
      ) : null}

      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}
      />
    </div>
  );
};
