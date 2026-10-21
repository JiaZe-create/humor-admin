import {requireAdmin} from '@/lib/auth';
import {Title} from '@/app/components';
import MediaForm from '@/app/media-form';
export default async function NewMedia(){await requireAdmin();return <><Title label="CONTENT LIBRARY / NEW" title="Add to the conversation." description="Save an AI-generated caption to the shared media database."/><MediaForm/></>}
