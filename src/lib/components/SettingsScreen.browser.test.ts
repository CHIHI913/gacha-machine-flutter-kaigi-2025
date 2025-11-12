import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/svelte';
import SettingsScreen from './SettingsScreen.svelte';
import { resetPrizes, prizesStore } from '../stores/prizes.svelte';
import { PrizeService } from '../services/prizeService';

describe('SettingsScreen', () => {
  let prizeService: PrizeService;

  beforeEach(() => {
    resetPrizes();
    prizeService = new PrizeService();
  });

  afterEach(() => {
    cleanup();
  });

  describe('初期表示', () => {
    it('should render settings screen', () => {
      render(SettingsScreen);

      // 設定画面が表示されることを確認
      expect(screen.getByTestId('settings-screen')).toBeDefined();
    });

    it('should show back button to gacha screen', () => {
      render(SettingsScreen);

      // ガチャ画面に戻るボタンが表示される
      const backButton = screen.getByTestId('back-button');
      expect(backButton).toBeDefined();
    });

    it('should show add prize button', () => {
      render(SettingsScreen);

      // 景品追加ボタンが表示される
      const addButton = screen.getByTestId('add-prize-button');
      expect(addButton).toBeDefined();
    });
  });

  describe('景品リスト表示', () => {
    it('should show empty message when no prizes', () => {
      render(SettingsScreen);

      // 景品が登録されていない場合、空のメッセージが表示される
      expect(screen.getByText(/景品が登録されていません/)).toBeDefined();
    });

    it('should show prize list when prizes exist', () => {
      prizeService.addPrize({
        name: 'Test Prize 1',
        imageUrl: '/test1.png',
        stock: 5,
      });
      prizeService.addPrize({
        name: 'Test Prize 2',
        imageUrl: '/test2.png',
        stock: 3,
      });

      render(SettingsScreen);

      // 景品リストが表示される
      expect(screen.getByText('Test Prize 1')).toBeDefined();
      expect(screen.getByText('Test Prize 2')).toBeDefined();
    });

    it('should display prize name for each prize', () => {
      prizeService.addPrize({
        name: 'Awesome Prize',
        imageUrl: '/awesome.png',
        stock: 10,
      });

      render(SettingsScreen);

      // 景品名が表示される
      expect(screen.getByText('Awesome Prize')).toBeDefined();
    });

    it('should display prize stock for each prize', () => {
      prizeService.addPrize({
        name: 'Test Prize',
        imageUrl: '/test.png',
        stock: 7,
      });

      render(SettingsScreen);

      // 在庫数が表示される
      expect(screen.getByText(/在庫: 7/)).toBeDefined();
    });

    it('should reactively update when prize is added', async () => {
      render(SettingsScreen);

      // 初期状態: 空のメッセージ
      expect(screen.getByText(/景品が登録されていません/)).toBeDefined();

      // 景品を追加
      prizeService.addPrize({
        name: 'New Prize',
        imageUrl: '/new.png',
        stock: 5,
      });

      // リアクティブに更新される
      await waitFor(() => {
        expect(screen.getByText('New Prize')).toBeDefined();
      });
    });
  });

  describe('画面遷移', () => {
    it('should call navigate callback when back button is clicked', async () => {
      let navigateCalled = false;
      let navigateScreen = '';

      render(SettingsScreen, {
        onnavigate: (event: CustomEvent) => {
          navigateCalled = true;
          navigateScreen = event.detail.screen;
        },
      });

      const backButton = screen.getByTestId('back-button');
      await backButton.click();

      expect(navigateCalled).toBe(true);
      expect(navigateScreen).toBe('gacha');
    });
  });

  describe('景品追加フォーム', () => {
    it('should show add form when add button is clicked', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // フォームが表示される
      expect(screen.getByTestId('prize-form')).toBeDefined();
    });

    it('should show name input field in add form', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // 名前入力フィールドが表示される
      expect(screen.getByLabelText(/景品名/)).toBeDefined();
    });

    it('should show image URL input field in add form', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // 画像URL入力フィールドが表示される
      expect(screen.getByLabelText(/画像URL/)).toBeDefined();
    });

    it('should show stock input field in add form', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // 在庫数入力フィールドが表示される
      expect(screen.getByLabelText(/在庫数/)).toBeDefined();
    });

    it('should show save button in add form', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // 保存ボタンが表示される
      expect(screen.getByText('保存')).toBeDefined();
    });

    it('should show cancel button in add form', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // キャンセルボタンが表示される
      expect(screen.getByText('キャンセル')).toBeDefined();
    });

    it('should add prize when save button is clicked with valid data', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // フォームに入力
      const nameInput = screen.getByLabelText(/景品名/) as HTMLInputElement;
      const imageUrlInput = screen.getByLabelText(/画像URL/) as HTMLInputElement;
      const stockInput = screen.getByLabelText(/在庫数/) as HTMLInputElement;

      nameInput.value = 'New Amazing Prize';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));

      imageUrlInput.value = '/amazing.png';
      imageUrlInput.dispatchEvent(new Event('input', { bubbles: true }));

      stockInput.value = '15';
      stockInput.dispatchEvent(new Event('input', { bubbles: true }));

      const totalStockInput = screen.getByLabelText(/仕入れ総数/) as HTMLInputElement;
      totalStockInput.value = '20';
      totalStockInput.dispatchEvent(new Event('input', { bubbles: true }));

      // 保存ボタンをクリック
      const saveButton = screen.getByText('保存');
      await saveButton.click();

      // 景品が追加される
      expect(screen.getByText('New Amazing Prize')).toBeDefined();
      expect(screen.getByText(/在庫: 15/)).toBeDefined();
    });

    it('should close form when cancel button is clicked', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      expect(screen.getByTestId('prize-form')).toBeDefined();

      // キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル');
      await cancelButton.click();

      // フォームが閉じる
      const forms = screen.queryAllByTestId('prize-form');
      expect(forms.length).toBe(0);
    });
  });

  describe('バリデーション', () => {
    it('should show error when name is empty', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // 名前を空にして保存
      const saveButton = screen.getByText('保存');
      await saveButton.click();

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/景品名を入力してください/)).toBeDefined();
      });
    });

    it('should show error when stock is negative', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // 名前を入力
      const nameInput = screen.getByLabelText(/景品名/) as HTMLInputElement;
      nameInput.value = 'Test Prize';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));

      // 在庫数を負の数にして保存
      const stockInput = screen.getByLabelText(/在庫数/) as HTMLInputElement;
      stockInput.value = '-5';
      stockInput.dispatchEvent(new Event('input', { bubbles: true }));

      const saveButton = screen.getByText('保存');
      await saveButton.click();

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/在庫数は0以上の数値を入力してください/)).toBeDefined();
      });
    });

    it('should not add prize when validation fails', async () => {
      render(SettingsScreen);

      const addButton = screen.getByTestId('add-prize-button');
      await addButton.click();

      // 名前を空にして保存
      const saveButton = screen.getByText('保存');
      await saveButton.click();

      // 景品は追加されない（エラーメッセージのみ表示）
      expect(prizesStore.prizes.length).toBe(0);
    });
  });

  describe('景品編集', () => {
    it('should show edit button for each prize', () => {
      prizeService.addPrize({
        name: 'Test Prize',
        imageUrl: '/test.png',
        stock: 5,
      });

      render(SettingsScreen);

      // 編集ボタンが表示される
      const editButton = screen.getByTestId('edit-prize-button-0');
      expect(editButton).toBeDefined();
    });

    it('should show edit form when edit button is clicked', async () => {
      prizeService.addPrize({
        name: 'Test Prize',
        imageUrl: '/test.png',
        stock: 5,
      });

      render(SettingsScreen);

      const editButton = screen.getByTestId('edit-prize-button-0');
      await editButton.click();

      // 編集フォームが表示される
      expect(screen.getByTestId('prize-form')).toBeDefined();
    });

    it('should pre-fill form with existing prize data in edit mode', async () => {
      prizeService.addPrize({
        name: 'Existing Prize',
        imageUrl: '/existing.png',
        stock: 10,
      });

      render(SettingsScreen);

      const editButton = screen.getByTestId('edit-prize-button-0');
      await editButton.click();

      // 既存データがフォームに表示される
      const nameInput = screen.getByLabelText(/景品名/) as HTMLInputElement;
      const imageUrlInput = screen.getByLabelText(/画像URL/) as HTMLInputElement;
      const stockInput = screen.getByLabelText(/在庫数/) as HTMLInputElement;

      expect(nameInput.value).toBe('Existing Prize');
      expect(imageUrlInput.value).toBe('/existing.png');
      expect(stockInput.value).toBe('10');
    });

    it('should update prize when save button is clicked in edit mode', async () => {
      const prize = prizeService.addPrize({
        name: 'Old Prize',
        imageUrl: '/old.png',
        stock: 5,
      });

      render(SettingsScreen);

      const editButton = screen.getByTestId('edit-prize-button-0');
      await editButton.click();

      // データを更新
      const nameInput = screen.getByLabelText(/景品名/) as HTMLInputElement;
      nameInput.value = 'Updated Prize';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));

      const stockInput = screen.getByLabelText(/在庫数/) as HTMLInputElement;
      stockInput.value = '20';
      stockInput.dispatchEvent(new Event('input', { bubbles: true }));

      const totalStockInput = screen.getByLabelText(/仕入れ総数/) as HTMLInputElement;
      totalStockInput.value = '25';
      totalStockInput.dispatchEvent(new Event('input', { bubbles: true }));

      // 保存
      const saveButton = screen.getByText('保存');
      await saveButton.click();

      // 景品が更新される
      await waitFor(() => {
        expect(screen.getByText('Updated Prize')).toBeDefined();
        expect(screen.getByText(/在庫: 20/)).toBeDefined();
      });
    });
  });

  describe('景品削除', () => {
    it('should show delete button for each prize', () => {
      prizeService.addPrize({
        name: 'Test Prize',
        imageUrl: '/test.png',
        stock: 5,
      });

      render(SettingsScreen);

      // 削除ボタンが表示される
      const deleteButton = screen.getByTestId('delete-prize-button-0');
      expect(deleteButton).toBeDefined();
    });

    it('should show confirmation dialog when delete button is clicked', async () => {
      prizeService.addPrize({
        name: 'Test Prize',
        imageUrl: '/test.png',
        stock: 5,
      });

      render(SettingsScreen);

      const deleteButton = screen.getByTestId('delete-prize-button-0');
      await deleteButton.click();

      // 確認ダイアログが表示される
      expect(screen.getByText(/削除してもよろしいですか/)).toBeDefined();
    });

    it('should delete prize when confirmation is accepted', async () => {
      prizeService.addPrize({
        name: 'Prize to Delete',
        imageUrl: '/delete.png',
        stock: 5,
      });

      render(SettingsScreen);

      expect(screen.getByText('Prize to Delete')).toBeDefined();

      const deleteButton = screen.getByTestId('delete-prize-button-0');
      await deleteButton.click();

      // 確認ダイアログで削除を確定（ダイアログ内の削除ボタンを探す）
      await waitFor(() => {
        expect(screen.getByText(/削除してもよろしいですか/)).toBeDefined();
      });

      const confirmButtons = screen.getAllByText('削除');
      // 2つ目が確認ダイアログの削除ボタン（1つ目は景品リストの削除ボタン）
      await confirmButtons[1].click();

      // 景品が削除される
      await waitFor(() => {
        const deletedPrizes = screen.queryAllByText('Prize to Delete');
        expect(deletedPrizes.length).toBe(0);
      });
    });

    it('should not delete prize when confirmation is cancelled', async () => {
      prizeService.addPrize({
        name: 'Prize to Keep',
        imageUrl: '/keep.png',
        stock: 5,
      });

      render(SettingsScreen);

      expect(screen.getByText('Prize to Keep')).toBeDefined();

      const deleteButton = screen.getByTestId('delete-prize-button-0');
      await deleteButton.click();

      // 確認ダイアログでキャンセル
      const cancelButton = screen.getByText('キャンセル');
      await cancelButton.click();

      // 景品は削除されない
      expect(screen.getByText('Prize to Keep')).toBeDefined();
      expect(prizesStore.prizes.length).toBe(1);
    });
  });
});
