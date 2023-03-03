import { debounce } from "lodash";
import { request } from "../api/common";
import { getKRW } from "../components/pages/myPage";
import ModalTwo from "../components/templates/modalTwo";

export default function My() {
	const app = document.querySelector("#app");
	const profileContainer = document.querySelector(".welcome-word-box");
	const addAccountBtn = document.querySelector(".btn-img");
	const ModalTemplate = document.querySelector(".modal-two");
	const ModalContents = document.querySelector(".modal-two-template");
	renderAccountList();

	addAccountBtn.addEventListener("click", () => {
		showAddAccountModal();
	});

	profileContainer.addEventListener("click", (e) => {
		const modalContainer = document.createElement("section");
		const nameInputBox = document.createElement("box");
		const profileImgInputBox = document.createElement("box");
		const nowPasswordInputBox = document.createElement("box");
		const newPasswordInputBox = document.createElement("box");
		const modalBtnBox = document.createElement("box");
		const completeBtn = document.createElement("img");
		const cancelBtn = document.createElement("img");
		const editingInputTemplate = [
			nameInputBox,
			profileImgInputBox,
			nowPasswordInputBox,
			newPasswordInputBox,
		];
		const inputBarInfo = [
			{ innerText: "닉네임", placeholder: "별명(20자이내)" },
			{ innerText: "프로필이미지", placeholder: "프로필 URL주소" },
			{ innerText: "현재비밀번호", placeholder: "현재 비밀번호" },
			{ innerText: "신규비밀번호", placeholder: "신규 비밀번호" },
		];
		const formData = {
			displayName: "",
			profileImgBase64: "",
			oldPassword: "",
			newPassword: "",
		};

		nameInputBox.classList.add("input-box");
		profileImgInputBox.classList.add("input-box");
		nowPasswordInputBox.classList.add("input-box");
		newPasswordInputBox.classList.add("input-box");
		modalBtnBox.classList.add("modal-btn-box");
		completeBtn.classList.add("complete-btn");
		cancelBtn.classList.add("cancel-btn");

		completeBtn.src = require("../asset/btnImg/add_btn.png");
		cancelBtn.src = require("../asset/btnImg/close_btn.png");

		editingInputTemplate.forEach((userInfoBox, idx) => {
			const inputBar = document.createElement("input");
			const inputBarName = document.createElement("span");

			inputBar.classList.add("input-bar");
			inputBarName.classList.add("input-bar-name");

			inputBar.type = "text";
			inputBarName.innerText = inputBarInfo[idx].innerText;
			inputBar.placeholder = inputBarInfo[idx].placeholder;

			modalContainer.append(inputBarName, inputBar);
		});

		completeBtn.addEventListener("click", async () => {
			const userName = nameInputBox.innerText;
			const profileImgUrl = profileImgInputBox.innerText;
			const presentPassword = nowPasswordInputBox.innerText;
			const newPassword = newPasswordInputBox.innerText;
			const params = [userName, profileImgUrl, nowPassword, newPassword];

			formData.displayName = userName;
			formData.oldPassword = presentPassword;
			formData.newPassword = newPassword;
			// 이미지 사진 추가 및 수정 기능은 추후 업데이트 예정

			await request("MEB0", formData);
			alert("프로필 수정 완료 되었습니다!");

			closeAddAccountModal();
		});

		ModalContents.append(modalContainer);
		showAddAccountModal(true);
	});

	function showAddAccountModal(isProfile) {
		if (!isProfile) {
			setAddAccountModal();
		}
		ModalTemplate.classList.remove("--hide");
	}

	function closeAddAccountModal() {
		ModalContents.innerHTML = "";
		ModalTwo.classList.add("--hide");
	}

	async function setAddAccountModal() {
		const availableBankInfo = await request("ACC01");
		const banksBox = document.createElement("div");
		const bankImg = document.createElement("img");
		const bankSelectedBar = document.createElement("select");
		const accountNumberBox = document.createElement("box");
		const cardName = document.createElement("span");
		const icTagBtn = document.createElement("img");
		const closeBtn = document.createElement("img");
		const formData = {
			bankCode: "",
			accountNumber: "",
			phoneNumber: "01012345678",
			signature: true,
		};
		let limitNumsLength = 0;
		const optionList = availableBankInfo
			.filter(({ disabled }) => !disabled)
			.map(({ name, code, digits }) => {
				const accountOption = document.createElement("option");
				accountOption.classList.add("account-option");
				accountOption.innerText = name;
				accountOption.value = name;
				accountOption.dataset.code = code;
				accountOption.dataset.digits = digits.join("");
				return accountOption;
			});

		closeBtn.classList.add("close-btn");
		banksBox.classList.add("banks-box");
		bankImg.classList.add("bank-img");
		bankSelectedBar.classList.add("bank-selected-bar");
		accountNumberBox.classList.add("account-number-box");
		cardName.classList.add("card-name");
		icTagBtn.classList.add("ic-tag-btn");

		limitNumsLength = optionList[0].dataset.digits
			.split("")
			.reduce((a, b) => a + b);
		setBankImage(optionList[0].value, bankImg);
		setAccountNumsBlock(optionList[0].dataset.digits, accountNumberBox);
		formData.bankCode = optionList[0].dataset.code;

		cardName.innerText = "TODAY ZIPSA";
		closeBtn.src = require("../asset/btnImg/close_btn.png");
		icTagBtn.src = require("../asset/bankImg/IC_chip.png");
		icTagBtn.style.width = "60px";
		icTagBtn.style.height = "60px";
		icTagBtn.style.opacity = "68%";
		ModalContents.style.backgroundImage =
			"linear-gradient(179deg, rgb(255, 254, 255) 18%,  #41b149 60%, rgb(0 134 70) 80%, #006200 100%)";
		banksBox.style.display = "flex";
		banksBox.style.height = "38px";
		bankImg.style.marginRight = "10px";
		bankImg.style.objectFit = "contain";

		bankSelectedBar.append(...optionList);

		bankSelectedBar.addEventListener("change", (e) => {
			accountNumberBox.innerHTML = "";
			const option = Array.from(e.target.children).find((option) => {
				return option.value === e.target.value;
			});

			formData.bankCode = option.dataset.code;
			console.log(e.target.value);
			setBankImage(e.target.value, bankImg);
			setAccountNumsBlock(option.dataset.digits, accountNumberBox);
			onChange(option);
		});

		icTagBtn.addEventListener("click", async (e) => {
			let accountNumbers = "";
			accountNumberBox.children[0]
				.querySelectorAll(".account-input-block")
				.forEach((block) => {
					accountNumbers += block.value;
					limitNumsLength += block.maxLength;
				});

			if (!isDigit(accountNumbers)) {
				formData.accountNumber = accountNumbers;
				if (!setAddAccount(formData) || accountNumbers < limitNumsLength) {
					alert("올바르지 않은 계좌 번호입니다.");
				} else {
					alert("계좌가 정상적으로 등록 되었습니다.");
					closeAddAccountModal();
					ModalContents.innerHTML = "";

					account;
					renderAccountList();
				}
			}
		});

		closeBtn.addEventListener("click", (e) => {
			closeAddAccountModal();
		});

		banksBox.append(bankImg, bankSelectedBar);
		ModalContents.append(
			banksBox,
			accountNumberBox,
			cardName,
			icTagBtn,
			closeBtn
		);
	}
}

function setAccountNumsBlock(optionDatasetDigits, accountNumberBox) {
	const accountNumberBlockBox = document.createElement("box");
	const inputAlertWord = document.createElement("sapn");
	const accountInputBlockList = optionDatasetDigits
		.split("")
		.map((maxLength) => {
			const accountInputBlock = document.createElement("input");
			accountInputBlock.classList.add("account-input-block");
			accountInputBlock.maxLength = maxLength;
			accountInputBlock.placeholder = `${maxLength}자리`;

			return accountInputBlock;
		});

	accountNumberBlockBox.classList.add("account-number-block-box");
	inputAlertWord.classList.add("input-alert-word");

	accountInputBlockList.forEach((block) => {
		block.addEventListener("keydown", (e) => {
			onKeyDown(e, e.target);
		});
	});
	accountNumberBlockBox.append(...accountInputBlockList);
	accountNumberBox.append(accountNumberBlockBox, inputAlertWord);
}

function setBankImage(bankName, bankImg) {
	switch (bankName) {
		case "KB국민은행":
			bankImg.src = require("../asset/bankImg/kb_bank.png");
			break;
		case "신한은행":
			bankImg.src = require("../asset/bankImg/sh_bank.png");
			break;
		case "우리은행":
			bankImg.src = require("../asset/bankImg/woori_bank.png");
			break;
		case "하나은행":
			bankImg.src = require("../asset/bankImg/hana_bank.png");
			break;
		case "케이뱅크":
			bankImg.src = require("../asset/bankImg/k_bank.png");
			break;
		case "카카오뱅크":
			bankImg.src = require("../asset/bankImg/kakao_bank.png");
			break;
		case "NH농협은행":
			bankImg.src = require("../asset/bankImg/nh_bank.png");
			break;
	}
}

const debounceOnKeydown = debounce((error) => {
	document.querySelector(".input-alert-word").innerText = error;
	setInputAlertWord();
}, 100);

function setInputAlertWord() {
	setTimeout(() => {
		document.querySelector(".input-alert-word").innerText = "";
	}, 1200);
}

function onKeyDown(e, accountBlock) {
	document.querySelector(".ic-tag-btn").style.opacity = "100%";

	if (isDigit(accountBlock.value) && e.key !== "Backspace" && e.key !== "") {
		debounceOnKeydown("숫자를 입력하세요!");
		return;
	}

	if (
		accountBlock.maxLength > accountBlock.value.length &&
		e.key !== "Backspace" &&
		e.key !== ""
	) {
		debounceOnKeydown(`${accountBlock.maxLength}글자를 입력하세요!`);
		return;
	}
}

function isDigit(word) {
	return word.match(/(?:[a-z]|[가-힣])+/gi) ? true : false;
}

async function setAddAccount(formData) {
	const res = await request("ACC03", formData);
	if (typeof res === "string" && res.length > 1) {
		console.log(res);
		return false;
	}
	console.log(res);
	return true;
}

async function renderAccountList() {
	const accountsInfo = await request("ACC02");
	const totalBalance = accountsInfo.totalBalance;
	const accountsListItems = accountsList(accountsInfo.accounts);
	const AccountListBox = document.querySelector(".accounts-list");
	AccountListBox.innerHTML = "";
	AccountListBox.append(...accountsListItems);
}

const accountsList = (accountsInfo) => {
	const formData = {
		accountId: "",
		signature: true,
	};
	return accountsInfo.map((account) => {
		const accountContainer = document.createElement("box");
		const bankImgBox = document.createElement("div");
		const bankImg = document.createElement("img");
		const accountInfoBox = document.createElement("div");
		const accountInfo = document.createElement("span");
		const accountBalance = document.createElement("span");
		const deleteBtn = document.createElement("img");

		accountContainer.classList.add("account-container");
		bankImgBox.classList.add("bank-img-box");
		bankImg.classList.add("bank-img");
		accountInfoBox.classList.add("account-info-box");
		accountInfo.classList.add("account-info");
		accountBalance.classList.add("account-balance");
		deleteBtn.classList.add("delete-btn");

		setBankImage(account.bankName, bankImg);
		accountInfo.innerText = `${account.bankName} ${account.accountNumber}`;
		accountBalance.innerText = getKRW(account.balance);
		deleteBtn.src = require("../asset/btnImg/close_btn.png");
		deleteBtn.dataset.id = account.id;

		deleteBtn.addEventListener("click", async (e) => {
			alert("계좌가 해지 완료 되었습니다.");
			formData.accountId = e.target.dataset.id;
			request("ACC04", formData);
			renderAccountList();
		});

		bankImgBox.append(bankImg);
		accountInfoBox.append(accountInfo, accountBalance);
		accountContainer.append(bankImgBox, accountInfoBox, deleteBtn);
		return accountContainer;
	});
};

function showAlertModalDeletingAccount(Modal) {
	ModalTwo.classList.remove("--hide");
}

function closeAlertModalDeletingAccount(Modal) {
	ModalTwo.classList.add("--hide");
}
