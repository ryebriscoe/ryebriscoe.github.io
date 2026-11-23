# Hugging Face setup checklist (phone-friendly)

Do the steps **in this order**. The token comes last so it's the only thing
on your clipboard when you paste it into GitHub.

If a page is missing a menu or button on your phone, open your browser menu
and turn on **Desktop site**.

---

## 1. Create the Space

Open **huggingface.co/new-space** (signed in as **rye22**).

- [ ] Owner: **rye22**
- [ ] Space name: **ask-about-ariya** (exactly)
- [ ] SDK: **Gradio**, template **Blank**
- [ ] Hardware: **ZeroGPU** (not "CPU basic")
- [ ] Visibility: **Public**
- [ ] Tap **Create Space**

A build error or empty page afterwards is normal: no code has been sent yet.

❗ No ZeroGPU option? Stop and write down which options you see.

## 2. Add the DEVICE variable

On the Space page: **Settings** → **Variables and secrets** → **New variable**
(variable, not secret).

- [ ] Name: **DEVICE**
- [ ] Value: **cuda**
- [ ] Tap **Save**

## 3. Create the token (copy nothing else after this)

Open **huggingface.co/settings/tokens** → **Create new token**.

- [ ] Type: **Write**
- [ ] Name: **github-sync**
- [ ] Tap **Create token**
- [ ] Tap **Copy**. Go straight to step 4.

## 4. Paste the token into GitHub

Open **github.com/ryebriscoe/portfolio-chatbot/settings/secrets/actions**
in your phone's browser (the GitHub app can't do this).

- [ ] Tap **New repository secret**
- [ ] Name: **HF_TOKEN**
- [ ] Secret: paste the token
- [ ] Tap **Add secret**

You should now see **HF_TOKEN** in the list. ✅

## If something goes wrong

- **Lost the token, or pasted the wrong thing?** Delete it on the Hugging Face
  tokens page, make a new one (step 3), and on GitHub open **HF_TOKEN** →
  **Update** and paste the new one. Nothing breaks.
- **Never** paste the token into a chat, note, or email.

## 5. Finish up

Check that the secret and Space exist, merge `rag-chatbot` into
`main`, send the code to the Space, and watch the first build (5–10 minutes).
