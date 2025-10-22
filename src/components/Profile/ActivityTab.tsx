import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  Code,
  Heart,
  ThumbsUp,
  MessageSquare,
  Star,
} from 'lucide-react';
import { DeveloperAccountDialog } from '@/components/DeveloperAccountDialog';

interface ActivityTabProps {
  userId: string;
}

export default function ActivityTab({ userId }: ActivityTabProps) {
  const { t } = useTranslation();
  const [devDialogOpen, setDevDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.actions.title')}</CardTitle>
          <CardDescription>
            {t('profile.actions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <DollarSign className="w-4 h-4 mr-2" />
            {t('profile.actions.donate')}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setDevDialogOpen(true)}
          >
            <Code className="w-4 h-4 mr-2" />
            {t('profile.actions.registerDev')}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full justify-start">
              <Heart className="w-4 h-4 mr-2" />
              {t('profile.actions.favorites')}
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <ThumbsUp className="w-4 h-4 mr-2" />
              {t('profile.actions.likes')}
            </Button>
          </div>

          <Button variant="outline" className="w-full justify-start">
            <MessageSquare className="w-4 h-4 mr-2" />
            {t('profile.actions.reviews')}
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <Star className="w-4 h-4 mr-2" />
            {t('profile.actions.ratings')}
          </Button>
        </CardContent>
      </Card>

      <DeveloperAccountDialog
        open={devDialogOpen}
        onClose={() => setDevDialogOpen(false)}
        userId={userId}
      />
    </div>
  );
}
